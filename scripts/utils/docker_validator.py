"""
Docker Compose validation utilities
"""

import asyncio
import logging
import subprocess
import sys
from typing import List, Optional, Dict, Any
import docker

logger = logging.getLogger(__name__)


class DockerValidator:
    """Docker Compose validation and management"""
    
    def __init__(self):
        try:
            self.client = docker.from_env()
        except Exception as e:
            logger.error(f"Failed to initialize Docker client: {e}")
            self.client = None
    
    async def is_stack_running(self) -> bool:
        """Check if the application stack is currently running"""
        try:
            result = await self._run_command(['docker', 'compose', 'ps', '--format', 'json'])
            if result.returncode != 0:
                return False
            
            # Parse JSON output to check if services are running
            services = []
            for line in result.stdout.strip().split('\n'):
                if line.strip():
                    try:
                        import json
                        services.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
            
            return len(services) > 0 and any(
                service.get('State', '') in ['running', 'healthy'] 
                for service in services
            )
        except Exception as e:
            logger.error(f"Error checking stack status: {e}")
            return False
    
    async def compose_up(self) -> bool:
        """Bring up the Docker Compose stack"""
        try:
            logger.info("Starting docker compose up...")
            result = await self._run_command(
                ['docker', 'compose', 'up', '--build', '-d'], 
                timeout=180
            )
            
            if result.returncode == 0:
                logger.info("✅ Docker Compose started successfully")
                return True
            else:
                logger.error(f"❌ Docker Compose failed: {result.stderr}")
                return False
                
        except asyncio.TimeoutError:
            logger.error("❌ Docker Compose up timed out after 180s")
            return False
        except Exception as e:
            logger.error(f"❌ Docker Compose error: {e}")
            return False
    
    async def compose_down(self) -> bool:
        """Stop and remove Docker Compose stack"""
        try:
            logger.info("Stopping docker compose down...")
            result = await self._run_command(
                ['docker', 'compose', 'down', '-v'],
                timeout=60
            )
            
            if result.returncode == 0:
                logger.info("✅ Docker Compose stopped successfully")
                return True
            else:
                logger.error(f"❌ Docker Compose down failed: {result.stderr}")
                return False
                
        except asyncio.TimeoutError:
            logger.error("❌ Docker Compose down timed out after 60s")
            return False
        except Exception as e:
            logger.error(f"❌ Docker Compose error: {e}")
            return False
    
    async def get_service_health(self, service_name: str) -> bool:
        """Get health status of a specific service"""
        try:
            if not self.client:
                # Fallback to docker compose command
                result = await self._run_command([
                    'docker', 'compose', 'ps', '--format', 'json', service_name
                ])
                
                if result.returncode != 0:
                    return False
                
                # Check service status
                import json
                for line in result.stdout.strip().split('\n'):
                    if line.strip():
                        service_info = json.loads(line)
                        state = service_info.get('State', '')
                        return state in ['running', 'healthy']
                
                return False
            
            # Use Docker client
            container_name = f"angularjs-realworld-example-app-{service_name}-1"
            container = self.client.containers.get(container_name)
            
            # Check if container is running
            if container.status != 'running':
                return False
            
            # Check health status if available
            if hasattr(container, 'attrs') and 'Health' in container.attrs.get('State', {}):
                health = container.attrs['State']['Health']
                return health.get('Status') == 'healthy'
            
            # No health check defined, assume running is sufficient
            return True
            
        except Exception as e:
            logger.debug(f"Could not get health for {service_name}: {e}")
            return False
    
    async def get_service_logs(self, service_name: str, lines: int = 50) -> Optional[str]:
        """Get recent logs from a service"""
        try:
            result = await self._run_command([
                'docker', 'compose', 'logs', '--tail', str(lines), service_name
            ])
            
            if result.returncode == 0:
                return result.stdout
            else:
                logger.error(f"Failed to get logs for {service_name}: {result.stderr}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting logs for {service_name}: {e}")
            return None
    
    async def wait_for_service_health(self, service_name: str, timeout: int = 60) -> bool:
        """Wait for a service to become healthy"""
        start_time = asyncio.get_event_loop().time()
        
        while True:
            try:
                if await self.get_service_health(service_name):
                    logger.info(f"✅ {service_name} is healthy")
                    return True
                
                # Check timeout
                if asyncio.get_event_loop().time() - start_time > timeout:
                    logger.warning(f"⏰ Timeout waiting for {service_name} to become healthy")
                    return False
                
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.error(f"Error waiting for {service_name} health: {e}")
                return False
    
    async def _run_command(self, command: List[str], timeout: Optional[int] = None) -> subprocess.CompletedProcess:
        """Run a command with timeout"""
        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd='..'  # Run from project root
            )
            
            stdout, stderr = await asyncio.wait_for(
                process.communicate(), 
                timeout=timeout
            )
            
            return subprocess.CompletedProcess(
                args=command,
                returncode=process.returncode,
                stdout=stdout.decode('utf-8', errors='ignore'),
                stderr=stderr.decode('utf-8', errors='ignore')
            )
            
        except asyncio.TimeoutError:
            process.kill()
            await process.wait()
            raise
        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            raise