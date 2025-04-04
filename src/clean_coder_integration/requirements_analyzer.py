import os
import re
import logging
from typing import Dict, List, Optional, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RequirementsAnalyzer:
    """
    Analyzes requirements from documentation files and extracts structured information
    for planning and implementation tracking.
    """
    
    def __init__(self, docs_folder: str = "docs"):
        """
        Initialize the requirements analyzer.
        
        Args:
            docs_folder: Path to the documentation folder
        """
        self.docs_folder = docs_folder
        self.requirements = {}
        self.implementation_steps = []
        
    def load_docs(self) -> Dict[str, str]:
        """
        Load all markdown files from the docs folder.
        
        Returns:
            Dictionary mapping filenames to their content
        """
        docs = {}
        try:
            for filename in os.listdir(self.docs_folder):
                if filename.endswith(".md"):
                    file_path = os.path.join(self.docs_folder, filename)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        docs[filename] = f.read()
            logger.info(f"Loaded {len(docs)} documentation files")
            return docs
        except Exception as e:
            logger.error(f"Error loading documentation files: {str(e)}")
            return {}
    
    def extract_requirements(self, docs: Dict[str, str]) -> Dict[str, List[str]]:
        """
        Extract requirements from documentation files.
        
        Args:
            docs: Dictionary mapping filenames to their content
            
        Returns:
            Dictionary mapping requirement categories to lists of requirements
        """
        requirements = {
            "functional": [],
            "technical": [],
            "ui": [],
            "architecture": []
        }
        
        for filename, content in docs.items():
            # Extract section headers and their content
            sections = re.split(r'##\s+', content)
            
            for section in sections:
                if not section.strip():
                    continue
                
                lines = section.split('\n')
                section_title = lines[0].strip()
                section_content = '\n'.join(lines[1:]).strip()
                
                # Categorize requirements based on section titles and content
                if any(keyword in section_title.lower() for keyword in ["feature", "functionality", "capabilities"]):
                    requirements["functional"].extend(self._extract_list_items(section_content))
                elif any(keyword in section_title.lower() for keyword in ["technical", "implementation", "technology"]):
                    requirements["technical"].extend(self._extract_list_items(section_content))
                elif any(keyword in section_title.lower() for keyword in ["ui", "interface", "user experience"]):
                    requirements["ui"].extend(self._extract_list_items(section_content))
                elif any(keyword in section_title.lower() for keyword in ["architecture", "structure", "design"]):
                    requirements["architecture"].extend(self._extract_list_items(section_content))
        
        # Clean up and deduplicate requirements
        for category in requirements:
            requirements[category] = list(set(req for req in requirements[category] if req))
        
        logger.info(f"Extracted requirements: {sum(len(reqs) for reqs in requirements.values())} total")
        return requirements
    
    def _extract_list_items(self, text: str) -> List[str]:
        """
        Extract list items from markdown text.
        
        Args:
            text: Markdown text
            
        Returns:
            List of extracted items
        """
        # Match both unordered lists (-, *, +) and ordered lists (1., 2., etc.)
        list_items = re.findall(r'^\s*(?:[-*+]|\d+\.)\s+(.*?)$', text, re.MULTILINE)
        
        # Also extract paragraphs that might contain requirements
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        # Combine and clean up
        all_items = list_items + paragraphs
        return [item.strip() for item in all_items if item.strip()]
    
    def generate_implementation_steps(self) -> List[Dict]:
        """
        Generate implementation steps based on the extracted requirements.
        
        Returns:
            List of implementation step dictionaries with status
        """
        docs = self.load_docs()
        self.requirements = self.extract_requirements(docs)
        
        # Look for existing implementation steps in the docs
        implementation_steps = []
        for filename, content in docs.items():
            if "implementation" in filename.lower() or "plan" in filename.lower():
                # Try to find structured implementation steps
                steps = self._extract_implementation_steps(content)
                if steps:
                    implementation_steps.extend(steps)
        
        # If no implementation steps found, generate them from requirements
        if not implementation_steps:
            implementation_steps = self._generate_steps_from_requirements()
        
        self.implementation_steps = implementation_steps
        logger.info(f"Generated {len(implementation_steps)} implementation steps")
        return implementation_steps
    
    def _extract_implementation_steps(self, content: str) -> List[Dict]:
        """
        Extract implementation steps from documentation content.
        
        Args:
            content: Documentation content
            
        Returns:
            List of implementation step dictionaries
        """
        steps = []
        
        # Look for markdown task lists
        task_list_items = re.findall(r'^\s*[-*+]\s+\[([ xX])\]\s+(.*?)$', content, re.MULTILINE)
        for status, description in task_list_items:
            completed = status.lower() == 'x'
            steps.append({
                "description": description.strip(),
                "completed": completed,
                "source": "documentation"
            })
        
        # Look for numbered lists that might be steps
        if not steps:
            numbered_items = re.findall(r'^\s*(\d+)\.?\s+(.*?)$', content, re.MULTILINE)
            for number, description in numbered_items:
                steps.append({
                    "description": description.strip(),
                    "completed": False,  # Default to not completed
                    "source": "documentation"
                })
        
        return steps
    
    def _generate_steps_from_requirements(self) -> List[Dict]:
        """
        Generate implementation steps from extracted requirements.
        
        Returns:
            List of implementation step dictionaries
        """
        steps = []
        
        # Convert functional requirements to implementation steps
        for req in self.requirements.get("functional", []):
            steps.append({
                "description": f"Implement {req}",
                "completed": False,
                "source": "generated",
                "category": "functional"
            })
        
        # Convert technical requirements to implementation steps
        for req in self.requirements.get("technical", []):
            steps.append({
                "description": f"Implement {req}",
                "completed": False,
                "source": "generated",
                "category": "technical"
            })
        
        # Convert UI requirements to implementation steps
        for req in self.requirements.get("ui", []):
            steps.append({
                "description": f"Implement UI for {req}",
                "completed": False,
                "source": "generated",
                "category": "ui"
            })
        
        # Convert architecture requirements to implementation steps
        for req in self.requirements.get("architecture", []):
            steps.append({
                "description": f"Set up {req}",
                "completed": False,
                "source": "generated",
                "category": "architecture"
            })
        
        return steps
    
    def save_implementation_plan(self, output_file: str = "implementation_plan.md") -> str:
        """
        Save the implementation plan to a markdown file.
        
        Args:
            output_file: Path to the output file
            
        Returns:
            Path to the saved file
        """
        if not self.implementation_steps:
            self.generate_implementation_steps()
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Implementation Plan\n\n")
            
            # Group steps by category
            categories = {}
            for step in self.implementation_steps:
                category = step.get("category", "general")
                if category not in categories:
                    categories[category] = []
                categories[category].append(step)
            
            # Write steps by category
            for category, steps in categories.items():
                f.write(f"## {category.capitalize()} Implementation\n\n")
                for i, step in enumerate(steps, 1):
                    checkbox = "[x]" if step["completed"] else "[ ]"
                    f.write(f"{checkbox} {step['description']}\n")
                f.write("\n")
        
        logger.info(f"Saved implementation plan to {output_file}")
        return output_file

if __name__ == "__main__":
    analyzer = RequirementsAnalyzer()
    analyzer.generate_implementation_steps()
    analyzer.save_implementation_plan()