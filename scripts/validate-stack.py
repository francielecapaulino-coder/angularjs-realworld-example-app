#!/usr/bin/env python3
"""
Stack Validation Script - Slice 028
Automated validation of LGTM observability stack (Loki/Grafana/Tempo/Metrics)

Usage:
    python scripts/validate-stack.py [--verbose]
    python scripts/validate-stack.py --cleanup-only
"""

import argparse
import asyncio
import json
import logging
import sys
import time
import yaml
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Import utilities
sys.path.append(str(Path(__file__).parent))
from utils.docker_validator import DockerValidator
from utils.health_checker import HealthChecker
from utils.metrics_validator import MetricsValidator
from utils.logs_validator import LogsValidator
from utils.report_generator import ReportGenerator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class StackValidator:
    """Main stack validation orchestrator"""
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        if verbose:
            logging.getLogger().setLevel(logging.DEBUG)
        
        self.start_time = datetime.now()
        self.results = {
            'validation_id': f"validation-{self.start_time.strftime('%Y%m%d-%H%M%S')}",
            'start_time': self.start_time.isoformat(),
            'services': {},
            'tests': [],
            'overall_status': 'UNKNOWN',
            'duration_seconds': 0,
            'errors': []
        }
        
        # Initialize validators
        self.docker_validator = DockerValidator()
        self.health_checker = HealthChecker()
        self.metrics_validator = MetricsValidator()
        self.logs_validator = LogsValidator()
        self.report_generator = ReportGenerator()
    
    async def setup_stack(self) -> bool:
        """Setup and start the application stack"""
        logger.info("🚀 Setting up application stack...")
        
        try:
            # Check if stack is already running
            if await self.docker_validator.is_stack_running():
                logger.info("✅ Stack already running")
                return True
            
            # Bring up the stack
            success = await self.docker_validator.compose_up()
            if success:
                logger.info("✅ Stack started successfully")
                # Wait for services to be ready
                await asyncio.sleep(30)
                return True
            else:
                logger.error("❌ Failed to start stack")
                return False
                
        except Exception as e:
            logger.error(f"❌ Stack setup error: {e}")
            self.results['errors'].append(f"Stack setup failed: {e}")
            return False
    
    async def validate_docker_services(self) -> Dict[str, bool]:
        """Validate Docker services are running and healthy"""
        logger.info("🐳 Validating Docker services...")
        
        services_status = {}
        expected_services = [
            'db', 'api', 'web', 'prometheus', 'loki', 'tempo', 'grafana', 'promtail'
        ]
        
        for service in expected_services:
            try:
                status = await self.docker_validator.get_service_health(service)
                services_status[service] = status
                logger.info(f"{'✅' if status else '❌'} {service}: {'healthy' if status else 'unhealthy'}")
            except Exception as e:
                services_status[service] = False
                logger.error(f"❌ {service}: error checking health - {e}")
                self.results['errors'].append(f"Service {service} health check failed: {e}")
        
        self.results['services'] = services_status
        return services_status
    
    async def validate_health_endpoints(self) -> Dict[str, bool]:
        """Validate critical health endpoints"""
        logger.info("🔍 Validating health endpoints...")
        
        endpoints = {
            'frontend': 'http://localhost:8080',
            'api_health': 'http://localhost:8081/api/health',
            'api_actuator': 'http://localhost:8081/actuator/health'
        }
        
        results = {}
        for name, url in endpoints.items():
            try:
                status_code, response_time = await self.health_checker.check_endpoint(url)
                success = status_code == 200 and response_time < 5000
                results[name] = success
                logger.info(f"{'✅' if success else '❌'} {name}: {status_code} ({response_time}ms)")
            except Exception as e:
                results[name] = False
                logger.error(f"❌ {name}: failed - {e}")
                self.results['errors'].append(f"Health endpoint {name} failed: {e}")
        
        return results
    
    async def validate_prometheus_metrics(self) -> Dict[str, bool]:
        """Validate Prometheus metrics collection"""
        logger.info("📊 Validating Prometheus metrics...")
        
        try:
            # Check Prometheus is accessible
            prometheus_healthy = await self.metrics_validator.check_prometheus_health()
            if not prometheus_healthy:
                logger.error("❌ Prometheus health check failed")
                return {'prometheus_health': False}
            
            # Check targets are up
            targets_status = await self.metrics_validator.check_targets()
            logger.info(f"✅ Prometheus targets: {targets_status}")
            
            # Check specific metrics exist
            metrics_exists = await self.metrics_validator.check_specific_metrics()
            logger.info(f"✅ Expected metrics found: {metrics_exists}")
            
            return {
                'prometheus_health': True,
                'targets_up': targets_status,
                'metrics_exist': metrics_exists,
                'overall': targets_status and metrics_exists
            }
            
        except Exception as e:
            logger.error(f"❌ Metrics validation failed: {e}")
            self.results['errors'].append(f"Metrics validation failed: {e}")
            return {'overall': False}
    
    async def validate_log_collection(self) -> Dict[str, bool]:
        """Validate log collection and processing"""
        logger.info("📝 Validating log collection...")
        
        try:
            # Check log files are being generated
            log_files = await self.logs_validator.check_log_files()
            logger.info(f"✅ Log files: {log_files}")
            
            # Check Promtail is collecting logs
            promtail_status = await self.logs_validator.check_promtail_status()
            logger.info(f"✅ Promtail status: {promtail_status}")
            
            # Check Loki is receiving logs (basic check)
            loki_status = await self.logs_validator.check_loki_status()
            logger.info(f"✅ Loki status: {loki_status}")
            
            return {
                'log_files': log_files,
                'promtail_healthy': promtail_status,
                'loki_healthy': loki_status,
                'overall': log_files and promtail_status
            }
            
        except Exception as e:
            logger.error(f"❌ Log validation failed: {e}")
            self.results['errors'].append(f"Log validation failed: {e}")
            return {'overall': False}
    
    async def cleanup_stack(self) -> bool:
        """Cleanup and stop the application stack"""
        logger.info("🧹 Cleaning up application stack...")
        
        try:
            success = await self.docker_validator.compose_down()
            if success:
                logger.info("✅ Stack stopped successfully")
                return True
            else:
                logger.error("❌ Failed to stop stack")
                return False
                
        except Exception as e:
            logger.error(f"❌ Stack cleanup error: {e}")
            self.results['errors'].append(f"Stack cleanup failed: {e}")
            return False
    
    async def generate_report(self) -> str:
        """Generate validation report"""
        logger.info("📋 Generating validation report...")
        
        # Calculate duration
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        self.results['end_time'] = end_time.isoformat()
        self.results['duration_seconds'] = duration
        
        # Determine overall status
        all_services_healthy = all(status for status in self.results['services'].values())
        no_critical_errors = len([e for e in self.results['errors'] if 'critical' in e.lower()]) == 0
        self.results['overall_status'] = 'PASS' if all_services_healthy and no_critical_errors else 'FAIL'
        
        # Generate report files
        json_report = await self.report_generator.generate_json_report(self.results)
        yaml_report = await self.report_generator.generate_yaml_report(self.results)
        
        reports_dir = Path(__file__).parent / "reports"
        reports_dir.mkdir(exist_ok=True)
        
        json_file = reports_dir / f"{self.results['validation_id']}.json"
        yaml_file = reports_dir / f"{self.results['validation_id']}.yaml"
        
        with open(json_file, 'w') as f:
            f.write(json_report)
        with open(yaml_file, 'w') as f:
            f.write(yaml_report)
        
        logger.info(f"✅ Reports generated:")
        logger.info(f"   JSON: {json_file}")
        logger.info(f"   YAML: {yaml_file}")
        
        return str(json_file)
    
    async def run_validation(self, cleanup_after: bool = True) -> str:
        """Run complete validation workflow"""
        logger.info("🎯 Starting LGTM stack validation...")
        
        try:
            # Setup stack
            if not await self.setup_stack():
                self.results['overall_status'] = 'FAIL'
                return await self.generate_report()
            
            # Validate components
            services_status = await self.validate_docker_services()
            health_status = await self.validate_health_endpoints()
            metrics_status = await self.validate_prometheus_metrics()
            logs_status = await self.validate_log_collection()
            
            # Record test results
            self.results['tests'] = [
                {'name': 'docker_services', 'status': services_status, 'timestamp': datetime.now().isoformat()},
                {'name': 'health_endpoints', 'status': health_status, 'timestamp': datetime.now().isoformat()},
                {'name': 'prometheus_metrics', 'status': metrics_status, 'timestamp': datetime.now().isoformat()},
                {'name': 'log_collection', 'status': logs_status, 'timestamp': datetime.now().isoformat()}
            ]
            
            # Cleanup if requested
            if cleanup_after:
                await self.cleanup_stack()
            
            # Generate and return report
            report_file = await self.generate_report()
            
            # Final summary
            status_icon = "✅ PASS" if self.results['overall_status'] == 'PASS' else "❌ FAIL"
            logger.info(f"{status_icon} Validation completed in {self.results['duration_seconds']:.1f}s")
            logger.info(f"📋 Report: {report_file}")
            
            return report_file
            
        except Exception as e:
            logger.error(f"❌ Validation workflow failed: {e}")
            self.results['errors'].append(f"Validation workflow failed: {e}")
            self.results['overall_status'] = 'ERROR'
            return await self.generate_report()


async def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Validate LGTM observability stack')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    parser.add_argument('--cleanup-only', action='store_true', help='Only cleanup the stack')
    parser.add_argument('--no-cleanup', action='store_true', help='Do not cleanup after validation')
    
    args = parser.parse_args()
    
    validator = StackValidator(verbose=args.verbose)
    
    if args.cleanup_only:
        success = await validator.cleanup_stack()
        sys.exit(0 if success else 1)
    else:
        report_file = await validator.run_validation(cleanup_after=not args.no_cleanup)
        status = 0 if validator.results['overall_status'] == 'PASS' else 1
        sys.exit(status)


if __name__ == "__main__":
    asyncio.run(main())