import os
import logging
import json
import time
import uuid
from typing import Dict, List, Optional, Tuple
from datetime import datetime

from .requirements_analyzer import RequirementsAnalyzer
from .github_analyzer import GitHubAnalyzer
from .slack_integration import SlackIntegration

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CleanCoderPlanner:
    """
    Main integration class that combines requirements analysis, GitHub tracking,
    and Slack communication to create a planning and implementation loop.
    """
    
    def __init__(
        self,
        docs_folder: str = "docs",
        repo_path: str = ".",
        output_folder: str = "implementation_plans",
        slack_channel: str = None,
        slack_token: str = None
    ):
        """
        Initialize the Clean Coder Planner.
        
        Args:
            docs_folder: Path to the documentation folder
            repo_path: Path to the repository
            output_folder: Path to the output folder for implementation plans
            slack_channel: Slack channel to send messages to
            slack_token: Slack API token
        """
        self.docs_folder = docs_folder
        self.repo_path = repo_path
        self.output_folder = output_folder
        
        # Create output folder if it doesn't exist
        os.makedirs(output_folder, exist_ok=True)
        
        # Initialize components
        self.requirements_analyzer = RequirementsAnalyzer(docs_folder=docs_folder)
        self.github_analyzer = GitHubAnalyzer(repo_path=repo_path)
        self.slack_integration = SlackIntegration(channel=slack_channel, token=slack_token)
        
        # State variables
        self.implementation_steps = []
        self.current_plan_file = None
        self.last_update_time = None
    
    def analyze_requirements(self) -> List[Dict]:
        """
        Analyze requirements from documentation files.
        
        Returns:
            List of implementation steps
        """
        logger.info("Analyzing requirements from documentation files...")
        self.implementation_steps = self.requirements_analyzer.generate_implementation_steps()
        
        # Generate a unique ID for each step
        for i, step in enumerate(self.implementation_steps):
            step["id"] = str(uuid.uuid4())
            step["order"] = i
        
        logger.info(f"Generated {len(self.implementation_steps)} implementation steps")
        return self.implementation_steps
    
    def save_implementation_plan(self) -> str:
        """
        Save the current implementation plan to a file.
        
        Returns:
            Path to the saved file
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(self.output_folder, f"implementation_plan_{timestamp}.md")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Implementation Plan\n\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
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
                for step in sorted(steps, key=lambda s: s.get("order", 0)):
                    checkbox = "[x]" if step.get("completed", False) else "[ ]"
                    f.write(f"{checkbox} {step['description']}\n")
                f.write("\n")
        
        logger.info(f"Saved implementation plan to {output_file}")
        self.current_plan_file = output_file
        return output_file
    
    def update_implementation_progress(self) -> Tuple[List[Dict], List[Dict]]:
        """
        Update implementation progress based on GitHub repository analysis.
        
        Returns:
            Tuple of (completed steps, pending steps)
        """
        logger.info("Updating implementation progress...")
        
        # Analyze implementation progress
        self.implementation_steps = self.github_analyzer.analyze_implementation_progress(self.implementation_steps)
        
        # Save updated implementation plan
        self.save_implementation_plan()
        
        # Split steps into completed and pending
        completed_steps = [step for step in self.implementation_steps if step.get("completed", False)]
        pending_steps = [step for step in self.implementation_steps if not step.get("completed", False)]
        
        logger.info(f"Implementation progress: {len(completed_steps)}/{len(self.implementation_steps)} steps completed")
        
        return completed_steps, pending_steps
    
    def send_next_implementation_request(self) -> Optional[Dict]:
        """
        Send the next implementation request to Slack.
        
        Returns:
            The step that was sent, or None if no pending steps
        """
        # Get pending steps
        pending_steps = [step for step in self.implementation_steps if not step.get("completed", False)]
        
        if not pending_steps:
            logger.info("No pending steps to implement")
            return None
        
        # Get the next step
        next_step = min(pending_steps, key=lambda s: s.get("order", 0))
        
        # Get context from related steps
        context = self._get_context_for_step(next_step)
        
        # Send implementation request
        logger.info(f"Sending implementation request for step: {next_step['description']}")
        message_ts = self.slack_integration.send_implementation_request(next_step, context=context)
        
        if message_ts:
            next_step["slack_message_ts"] = message_ts
            next_step["requested_at"] = datetime.now().isoformat()
        
        return next_step
    
    def _get_context_for_step(self, step: Dict) -> str:
        """
        Get context information for a step.
        
        Args:
            step: Implementation step
            
        Returns:
            Context information as a string
        """
        category = step.get("category", "general")
        
        # Get other steps in the same category
        related_steps = [
            s for s in self.implementation_steps 
            if s.get("category") == category and s.get("id") != step.get("id")
        ]
        
        # Get completed steps in the same category
        completed_related_steps = [s for s in related_steps if s.get("completed", False)]
        
        context = f"This task is part of the {category.capitalize()} implementation.\n\n"
        
        if completed_related_steps:
            context += "Related completed tasks:\n"
            for s in completed_related_steps[:3]:  # Limit to 3 to keep context manageable
                context += f"- {s['description']}\n"
            
            if len(completed_related_steps) > 3:
                context += f"- ...and {len(completed_related_steps) - 3} more\n"
            
            context += "\n"
        
        # Add information about relevant files if available
        relevant_files = []
        for s in completed_related_steps:
            if "relevant_file" in s:
                relevant_files.append(s["relevant_file"])
        
        if relevant_files:
            context += "Relevant files:\n"
            for file in set(relevant_files)[:5]:  # Limit to 5 unique files
                context += f"- {file}\n"
            
            if len(set(relevant_files)) > 5:
                context += f"- ...and {len(set(relevant_files)) - 5} more\n"
        
        return context
    
    def validate_implementation(self, step: Dict) -> Tuple[bool, str]:
        """
        Validate the implementation of a step.
        
        Args:
            step: Implementation step
            
        Returns:
            Tuple of (is_valid, feedback)
        """
        # This is a placeholder for actual validation logic
        # In a real implementation, this would check the code against requirements
        
        # For now, we'll just check if the step is marked as completed by the GitHub analyzer
        updated_steps = self.github_analyzer.analyze_implementation_progress([step])
        
        if updated_steps and updated_steps[0].get("completed", False):
            feedback = "Implementation validated successfully."
            if "completion_method" in updated_steps[0]:
                if updated_steps[0]["completion_method"] == "commit_message":
                    feedback += " Found relevant commit messages."
                elif updated_steps[0]["completion_method"] == "file_content":
                    feedback += f" Found implementation in {updated_steps[0].get('relevant_file', 'code')}."
            
            return True, feedback
        
        return False, "Implementation not found in the repository. Please commit your changes."
    
    def send_validation_result(self, step: Dict, is_valid: bool, feedback: str) -> Optional[str]:
        """
        Send a validation result to Slack.
        
        Args:
            step: Implementation step
            is_valid: Whether the implementation is valid
            feedback: Feedback on the implementation
            
        Returns:
            Message timestamp if successful, None otherwise
        """
        logger.info(f"Sending validation result for step: {step['description']}")
        message_ts = self.slack_integration.send_validation_result(step, is_valid, feedback)
        
        if message_ts:
            step["validation_message_ts"] = message_ts
            step["validated_at"] = datetime.now().isoformat()
            
            if is_valid:
                step["completed"] = True
                step["completed_at"] = datetime.now().isoformat()
        
        return message_ts
    
    def send_progress_update(self) -> Optional[str]:
        """
        Send a progress update to Slack.
        
        Returns:
            Message timestamp if successful, None otherwise
        """
        # Split steps into completed and pending
        completed_steps = [step for step in self.implementation_steps if step.get("completed", False)]
        pending_steps = [step for step in self.implementation_steps if not step.get("completed", False)]
        
        logger.info(f"Sending progress update: {len(completed_steps)}/{len(self.implementation_steps)} steps completed")
        message_ts = self.slack_integration.send_progress_update(completed_steps, pending_steps)
        
        if message_ts:
            self.last_update_time = datetime.now()
        
        return message_ts
    
    def run_planning_cycle(self):
        """
        Run a complete planning cycle:
        1. Analyze requirements
        2. Update implementation progress
        3. Send progress update
        4. Send next implementation request
        """
        logger.info("Starting planning cycle...")
        
        # Analyze requirements if not already done
        if not self.implementation_steps:
            self.analyze_requirements()
        
        # Update implementation progress
        completed_steps, pending_steps = self.update_implementation_progress()
        
        # Send progress update
        self.send_progress_update()
        
        # Send next implementation request if there are pending steps
        if pending_steps:
            self.send_next_implementation_request()
        
        logger.info("Planning cycle completed")
    
    def run_continuous_loop(self, interval_minutes: int = 30):
        """
        Run a continuous loop of planning cycles.
        
        Args:
            interval_minutes: Interval between planning cycles in minutes
        """
        logger.info(f"Starting continuous planning loop with {interval_minutes} minute interval...")
        
        try:
            while True:
                self.run_planning_cycle()
                
                logger.info(f"Sleeping for {interval_minutes} minutes...")
                time.sleep(interval_minutes * 60)
        
        except KeyboardInterrupt:
            logger.info("Planning loop interrupted by user")
        except Exception as e:
            logger.error(f"Error in planning loop: {str(e)}")
            raise

if __name__ == "__main__":
    # Example usage
    planner = CleanCoderPlanner(
        docs_folder="docs",
        repo_path=".",
        output_folder="implementation_plans",
        slack_channel="project-updates"
    )
    
    # Run a single planning cycle
    planner.run_planning_cycle()
    
    # Or run a continuous loop
    # planner.run_continuous_loop(interval_minutes=30)