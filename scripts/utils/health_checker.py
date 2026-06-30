"""
Health check utilities for application endpoints
"""

import asyncio
import logging
import aiohttp
from typing import Tuple, Optional, Dict, Any
import time

logger = logging.getLogger(__name__)


class HealthChecker:
    """Application health checking utilities"""
    
    def __init__(self):
        self.session = None
        self.timeout = aiohttp.ClientTimeout(total=10)
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(timeout=self.timeout)
        return self.session
    
    async def check_endpoint(self, url: str, method: str = 'GET') -> Tuple[int, int]:
        """
        Check health of an endpoint
        
        Returns:
            Tuple[status_code, response_time_ms]
        """
        session = await self._get_session()
        
        start_time = time.time()
        try:
            async with session.request(method, url) as response:
                response_time = int((time.time() - start_time) * 1000)
                
                # For some endpoints, we want to read the response
                if url.endswith('/health') or '/actuator/' in url:
                    await response.text()
                
                return response.status, response_time
                
        except asyncio.TimeoutError:
            logger.warning(f"⏰ Timeout checking {url}")
            return 0, 10000
        except Exception as e:
            logger.warning(f"❌ Error checking {url}: {e}")
            return 0, 0
        finally:
            if hasattr(self, 'session') and self.session:
                pass  # Keep session alive for reuse
    
    async def check_frontend_health(self) -> Dict[str, Any]:
        """Check frontend application health"""
        try:
            status_code, response_time = await self.check_endpoint('http://localhost:8080')
            
            # Frontend should return 200 and have reasonable response time
            status = status_code == 200 and response_time < 3000
            
            return {
                'status': status,
                'status_code': status_code,
                'response_time_ms': response_time,
                'details': f'Frontend {"healthy" if status else "unhealthy"} ({status_code})'
            }
            
        except Exception as e:
            return {
                'status': False,
                'error': str(e),
                'details': f'Frontend health check failed: {e}'
            }
    
    async def check_api_health(self) -> Dict[str, Any]:
        """Check API health endpoints"""
        results = {}
        
        # API health endpoint
        try:
            status_code, response_time = await self.check_endpoint('http://localhost:8081/api/health')
            results['api_health'] = {
                'status': status_code == 200 and response_time < 5000,
                'status_code': status_code,
                'response_time_ms': response_time,
                'details': f'API health {"OK" if status_code == 200 else "FAILED"} ({status_code})'
            }
        except Exception as e:
            results['api_health'] = {
                'status': False,
                'error': str(e),
                'details': f'API health check failed: {e}'
            }
        
        # Spring Boot Actuator health
        try:
            status_code, response_time = await self.check_endpoint('http://localhost:8081/actuator/health')
            results['actuator_health'] = {
                'status': status_code == 200 and response_time < 5000,
                'status_code': status_code,
                'response_time_ms': response_time,
                'details': f'Actuator {"OK" if status_code == 200 else "FAILED"} ({status_code})'
            }
        except Exception as e:
            results['actuator_health'] = {
                'status': False,
                'error': str(e),
                'details': f'Actuator health check failed: {e}'
            }
        
        # Metrics endpoint
        try:
            status_code, response_time = await self.check_endpoint('http://localhost:8081/actuator/prometheus')
            results['metrics_endpoint'] = {
                'status': status_code == 200 and response_time < 5000,
                'status_code': status_code,
                'response_time_ms': response_time,
                'details': f'Metrics endpoint {"OK" if status_code == 200 else "FAILED"} ({status_code})'
            }
        except Exception as e:
            results['metrics_endpoint'] = {
                'status': False,
                'error': str(e),
                'details': f'Metrics health check failed: {e}'
            }
        
        # Determine overall API health
        healthy_count = sum(1 for check in results.values() if check.get('status', False))
        overall_status = healthy_count >= 2  # At least 2 of 3 checks should pass
        
        results['overall'] = {
            'status': overall_status,
            'healthy_checks': healthy_count,
            'total_checks': len(results),
            'details': f'API health: {healthy_count}/{len(results)} checks passing'
        }
        
        return results
    
    async def check_observability_endpoints(self) -> Dict[str, Any]:
        """Check observability service endpoints"""
        results = {}
        
        # Prometheus
        try:
            status_code, response_time = await self.check_endpoint('http://localhost:9090/-/healthy')
            results['prometheus'] = {
                'status': status_code == 200 and response_time < 3000,
                'status_code': status_code,
                'response_time_ms': response_time,
                'details': f'Prometheus {"healthy" if status_code == 200 else "unhealthy"} ({status_code})'
            }
        except Exception as e:
            results['prometheus'] = {
                'status': False,
                'error': str(e),
                'details': f'Prometheus health check failed: {e}'
            }
        
        # Grafana (check login page)
        try:
            status_code, response_time = await self.check_endpoint('http://localhost:3000/login')
            results['grafana'] = {
                'status': status_code == 200 and response_time < 5000,
                'status_code': status_code,
                'response_time_ms': response_time,
                'details': f'Grafana {"accessible" if status_code == 200 else "unavailable"} ({status_code})'
            }
        except Exception as e:
            results['grafana'] = {
                'status': False,
                'error': str(e),
                'details': f'Grafana health check failed: {e}'
            }
        
        # Loki (basic health check)
        try:
            status_code, response_time = await self.check_endpoint('http://localhost:3100/ready')
            results['loki'] = {
                'status': status_code == 200 and response_time < 3000,
                'status_code': status_code,
                'response_time_ms': response_time,
                'details': f'Loki {"ready" if status_code == 200 else "not ready"} ({status_code})'
            }
        except Exception as e:
            results['loki'] = {
                'status': False,
                'error': str(e),
                'details': f'Loki health check failed: {e}'
            }
        
        # Tempo (basic check)
        try:
            status_code, response_time = await self.check_endpoint('http://localhost:3200/ready')
            results['tempo'] = {
                'status': status_code == 200 and response_time < 3000,
                'status_code': status_code,
                'response_time_ms': response_time,
                'details': f'Tempo {"ready" if status_code == 200 else "not ready"} ({status_code})'
            }
        except Exception as e:
            results['tempo'] = {
                'status': False,
                'error': str(e),
                'details': f'Tempo health check failed: {e}'
            }
        
        # Determine overall observability health
        healthy_count = sum(1 for check in results.values() if check.get('status', False))
        overall_status = healthy_count >= 3  # At least 3 of 4 observability services
        
        results['overall'] = {
            'status': overall_status,
            'healthy_services': healthy_count,
            'total_services': len(results),
            'details': f'Observability: {healthy_count}/{len(results)} services healthy'
        }
        
        return results
    
    async def wait_for_endpoint(self, url: str, timeout: int = 30) -> bool:
        """Wait for an endpoint to become available"""
        start_time = asyncio.get_event_loop().time()
        
        while True:
            try:
                status_code, _ = await self.check_endpoint(url)
                if status_code == 200:
                    return True
                
                # Check timeout
                if asyncio.get_event_loop().time() - start_time > timeout:
                    return False
                
                await asyncio.sleep(2)
                
            except Exception:
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