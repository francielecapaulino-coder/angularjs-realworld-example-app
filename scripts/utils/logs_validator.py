"""
Log collection and processing validation utilities
"""

import asyncio
import logging
import aiohttp
import json
import time
from pathlib import Path
from typing import Dict, Any, List
from urllib.parse import quote

logger = logging.getLogger(__name__)


class LogsValidator:
    """Log validation and processing utilities"""
    
    def __init__(self):
        self.loki_url = "http://localhost:3100"
        self.promtail_url = "http://localhost:9080"
        self.session = None
        self.timeout = aiohttp.ClientTimeout(total=10)
        self.log_file_path = Path(__file__).parent.parent.parent / "api" / "logs" / "application.log"
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(timeout=self.timeout)
        return self.session
    
    async def check_log_files(self) -> bool:
        """Check if log files are being generated"""
        try:
            # Check if log directory exists
            log_dir = self.log_file_path.parent
            if not log_dir.exists():
                logger.warning("⚠️ Log directory does not exist")
                return False
            
            # Check if log file exists and has content
            if not self.log_file_path.exists():
                logger.warning("⚠️ Application log file does not exist")
                return False
            
            # Check file size and recent content
            file_size = self.log_file_path.stat().st_size
            if file_size < 100:  # At least 100 bytes
                logger.warning("⚠️ Log file is too small")
                return False
            
            # Check last modification time (should be recent)
            mod_time = self.log_file_path.stat().st_mtime
            current_time = time.time()
            if current_time - mod_time > 300:  # 5 minutes old
                logger.warning("⚠️ Log file is not recent")
                return False
            
            # Check if file contains log entries
            with open(self.log_file_path, 'r') as f:
                content = f.read()
                if not content.strip():
                    logger.warning("⚠️ Log file is empty")
                    return False
                
                # Check for basic log pattern
                if ' INFO ' in content or ' DEBUG ' in content or ' WARN ' in content:
                    logger.info(f"✅ Log file found and contains entries ({file_size} bytes)")
                    return True
                else:
                    logger.warning("⚠️ Log file doesn't contain expected log patterns")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Error checking log files: {e}")
            return False
    
    async def check_promtail_status(self) -> bool:
        """Check if Promtail is running and healthy"""
        try:
            # Promtail doesn't have a standard health endpoint, 
            # so we check if the service is responding
            session = await self._get_session()
            
            # Try to check a basic endpoint
            async with session.get(f"{self.promtail_url}/metrics", timeout=5) as response:
                if response.status == 200:
                    # Check metrics content to see if Promtail is working
                    metrics_text = await response.text()
                    if 'promtail_build_info' in metrics_text:
                        logger.info("✅ Promtail is healthy")
                        return True
                    else:
                        logger.warning("⚠️ Promtail metrics unexpected")
                        return False
                else:
                    logger.error(f"❌ Promtail not responding: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Promtail health check failed: {e}")
            return False
    
    async def check_loki_status(self) -> bool:
        """Check if Loki is ready and accepting logs"""
        session = await self._get_session()
        
        try:
            # Check Loki ready endpoint
            async with session.get(f"{self.loki_url}/ready", timeout=10) as response:
                if response.status == 200:
                    logger.info("✅ Loki is ready")
                    return True
                else:
                    logger.error(f"❌ Loki not ready: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Loki status check failed: {e}")
            return False
    
    async def check_loki_labels(self) -> bool:
        """Check if Loki is receiving logs with expected labels"""
        session = await self._get_session()
        
        try:
            # Query Loki for recent logs
            query = quote('{job="conduit-backend-api"}')
            async with session.get(
                f"{self.loki_url}/loki/api/v1/query?query={query}&limit=10",
                timeout=10
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    result = data.get('data', {}).get('result', [])
                    
                    if result and result[0].get('values'):
                        logger.info(f"✅ Loki has logs with expected labels")
                        return True
                    else:
                        logger.warning("⚠️ Loki doesn't have logs with expected labels yet")
                        return False
                else:
                    logger.error(f"❌ Failed to query Loki labels: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Loki labels check failed: {e}")
            return False
    
    async def check_log_rotation(self) -> bool:
        """Check if log rotation is configured correctly"""
        try:
            log_dir = self.log_file_path.parent
            
            # Look for rotation patterns
            log_files = list(log_dir.glob("application.*.log"))
            
            if len(log_files) > 1:
                logger.info(f"✅ Log rotation working (found {len(log_files)} files)")
                return True
            elif len(log_files) == 1:
                logger.info("✅ Active log file exists (rotation may not be needed yet)")
                return True
            else:
                logger.warning("⚠️ No log files found")
                return False
                
        except Exception as e:
            logger.error(f"❌ Log rotation check failed: {e}")
            return False
    
    async def check_docker_logs(self) -> bool:
        """Check if Docker logs are properly captured"""
        try:
            import subprocess
            
            # Get logs from API container
            result = await asyncio.create_subprocess_exec(
                'docker', 'compose', 'logs', '--tail=10', 'api',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(self.log_file_path.parent.parent)
            )
            
            stdout, stderr = await result.communicate()
            
            if result.returncode == 0:
                log_content = stdout.decode('utf-8', errors='ignore')
                
                # Check for application logs in Docker output
                if 'INFO ' in log_content or 'ERROR ' in log_content or 'WARN ' in log_content:
                    logger.info("✅ Docker logs contain application output")
                    return True
                else:
                    logger.warning("⚠️ Docker logs don't show expected application output")
                    return False
            else:
                logger.error(f"❌ Failed to get Docker logs: {stderr.decode('utf-8', errors='ignore')}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Docker logs check failed: {e}")
            return False
    
    async def validate_log_flow(self) -> Dict[str, Any]:
        """Complete log flow validation"""
        logger.info("📝 Starting log validation...")
        
        results = {
            'file_logging': await self.check_log_files(),
            'promtail_status': await self.check_promtail_status(),
            'loki_status': await self.check_loki_status(),
            'loki_labels': await self.check_loki_labels(),
            'log_rotation': await self.check_log_rotation(),
            'docker_logs': await self.check_docker_logs()
        }
        
        # Determine overall status
        critical_checks = [
            results['file_logging'],
            results['promtail_status'],
            results['loki_status']
        ]
        
        passed_checks = sum(critical_checks)
        total_checks = len(critical_checks)
        
        results['overall'] = {
            'status': passed_checks >= 2,  # At least 2 of 3 critical checks
            'passed_checks': passed_checks,
            'total_checks': total_checks,
            'success_rate': passed_checks / total_checks
        }
        
        if results['overall']['status']:
            logger.info(f"✅ Log validation passed ({passed_checks}/{total_checks} critical)")
        else:
            logger.warning(f"⚠️ Log validation partially failed ({passed_checks}/{total_checks} critical)")
        
        # Log detailed status
        for check, status in results.items():
            if check != 'overall' and isinstance(status, bool):
                logger.debug(f"  {check}: {'✅' if status else '❌'}")
        
        return results
    
    async def wait_for_logs(self, timeout: int = 30) -> bool:
        """Wait for logs to appear"""
        start_time = asyncio.get_event_loop().time()
        
        while True:
            if await self.check_log_files():
                return True
            
            if asyncio.get_event_loop().time() - start_time > timeout:
                return False
            
            await asyncio.sleep(2)
    
    async def close(self):
        """Close HTTP session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()