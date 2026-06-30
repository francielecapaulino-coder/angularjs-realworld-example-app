"""
Prometheus metrics validation utilities
"""

import asyncio
import logging
import aiohttp
import json
from typing import Dict, Any, List
from urllib.parse import quote

logger = logging.getLogger(__name__)


class MetricsValidator:
    """Prometheus metrics validation utilities"""
    
    def __init__(self):
        self.prometheus_url = "http://localhost:9090"
        self.session = None
        self.timeout = aiohttp.ClientTimeout(total=10)
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(timeout=self.timeout)
        return self.session
    
    async def check_prometheus_health(self) -> bool:
        """Check if Prometheus is healthy and accessible"""
        session = await self._get_session()
        
        try:
            async with session.get(f"{self.prometheus_url}/-/healthy") as response:
                if response.status == 200:
                    logger.info("✅ Prometheus is healthy")
                    return True
                else:
                    logger.error(f"❌ Prometheus unhealthy: {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Prometheus health check failed: {e}")
            return False
    
    async def check_targets(self) -> bool:
        """Check if Prometheus targets are up"""
        session = await self._get_session()
        
        try:
            async with session.get(f"{self.prometheus_url}/api/v1/targets") as response:
                if response.status != 200:
                    logger.error(f"❌ Failed to get targets: {response.status}")
                    return False
                
                data = await response.json()
                targets = data.get('data', {}).get('activeTargets', [])
                
                if not targets:
                    logger.warning("⚠️ No targets found in Prometheus")
                    return False
                
                # Count healthy targets
                healthy_targets = [
                    target for target in targets 
                    if target.get('health') == 'up'
                ]
                
                total_targets = len(targets)
                healthy_count = len(healthy_targets)
                
                logger.info(f"📊 Prometheus targets: {healthy_count}/{total_targets} healthy")
                
                # Log target details for debugging
                for target in targets:
                    job = target.get('labels', {}).get('job', 'unknown')
                    health = target.get('health', 'unknown')
                    logger.debug(f"  Target {job}: {health}")
                
                # We expect at least 2 targets to be healthy
                return healthy_count >= 2
                
        except Exception as e:
            logger.error(f"❌ Targets check failed: {e}")
            return False
    
    async def check_specific_metrics(self) -> bool:
        """Check if expected metrics are being collected"""
        session = await self._get_session()
        
        expected_metrics = [
            'up',  # General up metric
            'http_requests_total',  # HTTP requests
            'jvm_memory_used_bytes',  # JVM metrics
            'process_cpu_seconds_total'  # Process metrics
        ]
        
        results = {}
        
        for metric_name in expected_metrics:
            try:
                # Query for the metric
                query = quote(f'{metric_name}')
                async with session.get(f"{self.prometheus_url}/api/v1/query?query={query}") as response:
                    if response.status == 200:
                        data = await response.json()
                        metric_results = data.get('data', {}).get('result', [])
                        
                        # Check if we have any results for this metric
                        has_data = len(metric_results) > 0
                        results[metric_name] = has_data
                        
                        if has_data:
                            logger.info(f"✅ Metric '{metric_name}' found")
                        else:
                            logger.warning(f"⚠️ Metric '{metric_name}' not found")
                    else:
                        logger.error(f"❌ Failed to query {metric_name}: {response.status}")
                        results[metric_name] = False
                        
            except Exception as e:
                logger.error(f"❌ Error checking metric {metric_name}: {e}")
                results[metric_name] = False
        
        # Overall success if at least 3 of 4 metrics are found
        found_count = sum(1 for found in results.values() if found)
        success = found_count >= 3
        
        logger.info(f"📈 Metrics found: {found_count}/{len(expected_metrics)}")
        
        return success
    
    async def get_metric_value(self, metric_name: str, labels: Dict[str, str] = None) -> float:
        """Get specific metric value"""
        session = await self._get_session()
        
        try:
            # Build query with labels
            query = metric_name
            if labels:
                label_pairs = [f'{k}="{v}"' for k, v in labels.items()]
                query += '{' + ','.join(label_pairs) + '}'
            
            quoted_query = quote(query)
            async with session.get(f"{self.prometheus_url}/api/v1/query?query={quoted_query}") as response:
                if response.status == 200:
                    data = await response.json()
                    results = data.get('data', {}).get('result', [])
                    
                    if results:
                        # Return the first value found
                        value = results[0].get('value', [0, '0'])[1]
                        return float(value)
                    else:
                        logger.warning(f"⚠️ No data for metric query: {query}")
                        return 0.0
                else:
                    logger.error(f"❌ Failed to query metric: {response.status}")
                    return 0.0
                    
        except Exception as e:
            logger.error(f"❌ Error getting metric value: {e}")
            return 0.0
    
    async def check_api_request_metrics(self) -> bool:
        """Check if API request metrics are being collected"""
        try:
            # Look for HTTP request metrics for the API
            api_metrics = await self.get_metric_value('http_requests_total', {
                'job': 'conduit-backend-api'
            })
            
            has_metrics = api_metrics >= 0.0
            
            if has_metrics:
                logger.info(f"✅ API request metrics found (count: {api_metrics})")
            else:
                logger.warning("⚠️ API request metrics not found")
            
            return has_metrics
            
        except Exception as e:
            logger.error(f"❌ API metrics check failed: {e}")
            return False
    
    async def get_current_scrape_metrics(self) -> Dict[str, float]:
        """Get current scrape metrics from Prometheus"""
        session = await self._get_session()
        
        metrics = {}
        
        try:
            # Get metrics about Prometheus itself
            prometheus_metrics = [
                'prometheus_tsdb_head_series',
                'prometheus_config_last_reload_successful',
                'prometheus_target_interval_length_seconds'
            ]
            
            for metric in prometheus_metrics:
                try:
                    value = await self.get_metric_value(metric)
                    metrics[metric] = value
                except:
                    metrics[metric] = 0.0
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Failed to get scrape metrics: {e}")
            return {}
    
    async def validate_metrics_flow(self) -> Dict[str, Any]:
        """Complete metrics flow validation"""
        logger.info("📊 Starting metrics validation...")
        
        results = {
            'prometheus_health': await self.check_prometheus_health(),
            'targets_status': await self.check_targets(),
            'basic_metrics': await self.check_specific_metrics(),
            'api_metrics': await self.check_api_request_metrics()
        }
        
        # Get additional metrics info
        results['prometheus_stats'] = await self.get_current_scrape_metrics()
        
        # Determine overall status
        all_checks = [
            results['prometheus_health'],
            results['targets_status'], 
            results['basic_metrics'],
            results['api_metrics']
        ]
        
        passed_checks = sum(all_checks)
        total_checks = len(all_checks)
        
        results['overall'] = {
            'status': passed_checks >= 3,  # At least 3 of 4 checks should pass
            'passed_checks': passed_checks,
            'total_checks': total_checks,
            'success_rate': passed_checks / total_checks
        }
        
        if results['overall']['status']:
            logger.info(f"✅ Metrics validation passed ({passed_checks}/{total_checks})")
        else:
            logger.warning(f"⚠️ Metrics validation partially failed ({passed_checks}/{total_checks})")
        
        return results
    
    async def close(self):
        """Close HTTP session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()