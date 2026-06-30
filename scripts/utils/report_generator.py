"""
Report generation utilities for validation results
"""

import json
import yaml
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class ReportGenerator:
    """Generate validation reports in various formats"""
    
    def __init__(self):
        self.templates_dir = Path(__file__).parent / "templates"
    
    async def generate_json_report(self, results: Dict[str, Any]) -> str:
        """Generate JSON validation report"""
        try:
            # Add metadata
            report_data = {
                'metadata': {
                    'generator': 'validate-stack.py',
                    'generated_at': datetime.now().isoformat(),
                    'version': 'slice-028',
                    'format': 'json'
                },
                'validation_results': results
            }
            
            json_report = json.dumps(report_data, indent=2, default=str)
            logger.info("✅ JSON report generated")
            return json_report
            
        except Exception as e:
            logger.error(f"❌ Failed to generate JSON report: {e}")
            return json.dumps({
                'error': f'Report generation failed: {e}',
                'original_results': results
            }, indent=2, default=str)
    
    async def generate_yaml_report(self, results: Dict[str, Any]) -> str:
        """Generate YAML validation report"""
        try:
            # Add metadata
            report_data = {
                'metadata': {
                    'generator': 'validate-stack.py',
                    'generated_at': datetime.now().isoformat(),
                    'version': 'slice-028',
                    'format': 'yaml'
                },
                'validation_results': results
            }
            
            yaml_report = yaml.dump(report_data, default_flow_style=False, allow_unicode=True)
            logger.info("✅ YAML report generated")
            return yaml_report
            
        except Exception as e:
            logger.error(f"❌ Failed to generate YAML report: {e}")
            return yaml.dump({
                'error': f'Report generation failed: {e}',
                'original_results': results
            }, default_flow_style=False, allow_unicode=True)
    
    async def generate_summary_report(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate summary report for quick viewing"""
        try:
            summary = {
                'validation_id': results.get('validation_id', 'unknown'),
                'overall_status': results.get('overall_status', 'UNKNOWN'),
                'duration_seconds': results.get('duration_seconds', 0),
                'timestamp': results.get('start_time', datetime.now().isoformat()),
                'summary': {
                    'services': {
                        'total': len(results.get('services', {})),
                        'healthy': sum(1 for s in results.get('services', {}).values() if s),
                        'failed': sum(1 for s in results.get('services', {}).values() if not s)
                    },
                    'tests': {
                        'total': len(results.get('tests', [])),
                        'passed': sum(1 for test in results.get('tests', []) if self._is_test_passed(test)),
                        'failed': sum(1 for test in results.get('tests', []) if not self._is_test_passed(test))
                    },
                    'errors': {
                        'total': len(results.get('errors', [])),
                        'critical': len([e for e in results.get('errors', []) if 'critical' in e.lower()]),
                        'warnings': len([e for e in results.get('errors', []) if 'warning' in e.lower()])
                    }
                }
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Failed to generate summary: {e}")
            return {'error': f'Summary generation failed: {e}'}
    
    def _is_test_passed(self, test: Dict[str, Any]) -> bool:
        """Check if a test passed based on its status field"""
        status = test.get('status', {})
        
        if isinstance(status, bool):
            return status
        elif isinstance(status, dict):
            # Check for overall status in complex results
            return status.get('overall', False)
        elif isinstance(status, str):
            return status.lower() in ['pass', 'ok', 'healthy', 'true']
        
        return False
    
    async def create_markdown_summary(self, results: Dict[str, Any]) -> str:
        """Generate Markdown summary report"""
        try:
            summary = await self.generate_summary_report(results)
            
            md_content = f"""
# Stack Validation Report

**Validation ID:** {summary['validation_id']}  
**Date:** {summary['timestamp']}  
**Status:** {'✅ PASS' if summary['overall_status'] == 'PASS' else '❌ FAIL'}  
**Duration:** {summary['duration_seconds']:.1f}s

## 📊 Summary

### Services Status
- **Total:** {summary['summary']['services']['total']}
- **✅ Healthy:** {summary['summary']['services']['healthy']}
- **❌ Failed:** {summary['summary']['services']['failed']}

### Test Results
- **Total:** {summary['summary']['tests']['total']}
- **✅ Passed:** {summary['summary']['tests']['passed']}
- **❌ Failed:** {summary['summary']['tests']['failed']}

### Errors
- **Total:** {summary['summary']['errors']['total']}
- **🚨 Critical:** {summary['summary']['errors']['critical']}
- **⚠️ Warnings:** {summary['summary']['errors']['warnings']}

## 📋 Service Details

"""
            
            # Add service details
            for service, status in results.get('services', {}).items():
                icon = '✅' if status else '❌'
                md_content += f"- {icon} **{service}**: {'Healthy' if status else 'Unhealthy'}\n"
            
            md_content += "\n## 📊 Test Details\n\n"
            
            # Add test details
            for test in results.get('tests', []):
                name = test.get('name', 'unknown')
                status = test.get('status', {})
                timestamp = test.get('timestamp', '')
                
                if isinstance(status, bool):
                    test_status = '✅ PASS' if status else '❌ FAIL'
                elif isinstance(status, dict):
                    overall = status.get('overall', False)
                    test_status = '✅ PASS' if overall else '❌ FAIL'
                else:
                    test_status = str(status)
                
                md_content += f"- **{name}**: {test_status}\n"
            
            # Add errors if any
            if results.get('errors'):
                md_content += "\n## 🚨 Errors\n\n"
                for error in results.get('errors', []):
                    md_content += f"- ❌ {error}\n"
            
            md_content += f"""
---

*Generated by validate-stack.py (Slice 028)*  
*For detailed results, see the accompanying JSON/YAML reports*
"""
            
            return md_content
            
        except Exception as e:
            return f"# Report Generation Failed\n\nError: {e}\n\nOriginal results: {results}"
    
    async def save_reports(self, results: Dict[str, Any], output_dir: Path) -> Dict[str, Path]:
        """Save all report formats to disk"""
        output_dir.mkdir(parents=True, exist_ok=True)
        validation_id = results.get('validation_id', f"report-{datetime.now().strftime('%Y%m%d-%H%M%S')}")
        
        files = {}
        
        try:
            # Generate and save JSON report
            json_content = await self.generate_json_report(results)
            json_file = output_dir / f"{validation_id}.json"
            with open(json_file, 'w') as f:
                f.write(json_content)
            files['json'] = json_file
            
            # Generate and save YAML report
            yaml_content = await self.generate_yaml_report(results)
            yaml_file = output_dir / f"{validation_id}.yaml"
            with open(yaml_file, 'w') as f:
                f.write(yaml_content)
            files['yaml'] = yaml_file
            
            # Generate and save Markdown summary
            md_content = await self.create_markdown_summary(results)
            md_file = output_dir / f"{validation_id}.md"
            with open(md_file, 'w') as f:
                f.write(md_content)
            files['markdown'] = md_file
            
            logger.info(f"✅ All reports saved to {output_dir}")
            return files
            
        except Exception as e:
            logger.error(f"❌ Failed to save reports: {e}")
            return files