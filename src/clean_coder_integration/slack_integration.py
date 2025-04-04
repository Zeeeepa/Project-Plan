import os
import json
import logging
from typing import Dict, List, Optional, Any
import boto3
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SlackIntegration:
    """
    Handles integration with Slack for sending implementation requests and updates.
    """
    
    def __init__(self, channel: str = None, token: str = None):
        """
        Initialize the Slack integration.
        
        Args:
            channel: Slack channel to send messages to
            token: Slack API token
        """
        self.channel = channel
        self.token = token
        self.client = None
        
        # Try to initialize from environment variables if not provided
        if not self.token:
            self.token = os.environ.get("SLACK_API_TOKEN")
        
        if not self.channel:
            self.channel = os.environ.get("SLACK_CHANNEL", "general")
        
        # Try to initialize from AWS Secrets Manager if still not available
        if not self.token and "AWS_REGION" in os.environ:
            try:
                secrets_client = boto3.client('secretsmanager', region_name=os.environ['AWS_REGION'])
                secret_data = json.loads(secrets_client.get_secret_value(
                    SecretId=os.environ.get('SLACK_AUTOMATION_BOT', 'slack-automation-bot')
                )['SecretString'])
                
                self.token = secret_data.get('SLACK_API_SECRET')
            except Exception as e:
                logger.error(f"Error getting Slack token from AWS Secrets Manager: {str(e)}")
        
        # Initialize Slack client if token is available
        if self.token:
            self.client = WebClient(token=self.token)
            logger.info(f"Initialized Slack client for channel: {self.channel}")
        else:
            logger.warning("No Slack token available. Messages will not be sent.")
    
    def send_implementation_request(self, step: Dict, context: str = "") -> Optional[str]:
        """
        Send an implementation request to Slack.
        
        Args:
            step: Implementation step dictionary
            context: Additional context for the implementation
            
        Returns:
            Message timestamp if successful, None otherwise
        """
        if not self.client:
            logger.warning("No Slack client available. Message not sent.")
            return None
        
        try:
            # Create message blocks
            blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "Implementation Request",
                        "emoji": True
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Task:* {step['description']}"
                    }
                }
            ]
            
            # Add context if provided
            if context:
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Context:*\n{context}"
                    }
                })
            
            # Add category if available
            if "category" in step:
                blocks.append({
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*Category:* {step['category'].capitalize()}"
                        }
                    ]
                })
            
            # Add action buttons
            blocks.append({
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Start Implementation",
                            "emoji": True
                        },
                        "style": "primary",
                        "value": json.dumps({"step_id": step.get("id", "unknown"), "action": "start"}),
                        "action_id": "start_implementation"
                    }
                ]
            })
            
            # Send message
            response = self.client.chat_postMessage(
                channel=self.channel,
                text=f"Implementation Request: {step['description']}",
                blocks=blocks
            )
            
            logger.info(f"Sent implementation request to Slack: {response['ts']}")
            return response['ts']
        
        except SlackApiError as e:
            logger.error(f"Error sending implementation request to Slack: {str(e)}")
            return None
    
    def send_progress_update(self, completed_steps: List[Dict], pending_steps: List[Dict]) -> Optional[str]:
        """
        Send a progress update to Slack.
        
        Args:
            completed_steps: List of completed implementation steps
            pending_steps: List of pending implementation steps
            
        Returns:
            Message timestamp if successful, None otherwise
        """
        if not self.client:
            logger.warning("No Slack client available. Message not sent.")
            return None
        
        try:
            # Calculate progress percentage
            total_steps = len(completed_steps) + len(pending_steps)
            progress_percentage = int(len(completed_steps) / total_steps * 100) if total_steps > 0 else 0
            
            # Create message blocks
            blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "Implementation Progress Update",
                        "emoji": True
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Progress:* {progress_percentage}% complete ({len(completed_steps)}/{total_steps} tasks)"
                    }
                }
            ]
            
            # Add completed steps
            if completed_steps:
                completed_text = "*Completed Tasks:*\n"
                for step in completed_steps[:5]:  # Limit to 5 to avoid message size limits
                    completed_text += f"✅ {step['description']}\n"
                
                if len(completed_steps) > 5:
                    completed_text += f"_...and {len(completed_steps) - 5} more_\n"
                
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": completed_text
                    }
                })
            
            # Add pending steps
            if pending_steps:
                pending_text = "*Pending Tasks:*\n"
                for step in pending_steps[:5]:  # Limit to 5 to avoid message size limits
                    pending_text += f"⬜ {step['description']}\n"
                
                if len(pending_steps) > 5:
                    pending_text += f"_...and {len(pending_steps) - 5} more_\n"
                
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": pending_text
                    }
                })
            
            # Add next steps
            if pending_steps:
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Next Task:* {pending_steps[0]['description']}"
                    }
                })
                
                # Add action button for next task
                blocks.append({
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Start Next Task",
                                "emoji": True
                            },
                            "style": "primary",
                            "value": json.dumps({"step_id": pending_steps[0].get("id", "unknown"), "action": "start"}),
                            "action_id": "start_implementation"
                        }
                    ]
                })
            
            # Send message
            response = self.client.chat_postMessage(
                channel=self.channel,
                text=f"Implementation Progress: {progress_percentage}% complete",
                blocks=blocks
            )
            
            logger.info(f"Sent progress update to Slack: {response['ts']}")
            return response['ts']
        
        except SlackApiError as e:
            logger.error(f"Error sending progress update to Slack: {str(e)}")
            return None
    
    def send_validation_result(self, step: Dict, is_valid: bool, feedback: str = "") -> Optional[str]:
        """
        Send a validation result to Slack.
        
        Args:
            step: Implementation step dictionary
            is_valid: Whether the implementation is valid
            feedback: Feedback on the implementation
            
        Returns:
            Message timestamp if successful, None otherwise
        """
        if not self.client:
            logger.warning("No Slack client available. Message not sent.")
            return None
        
        try:
            # Create message blocks
            blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "Implementation Validation Result",
                        "emoji": True
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Task:* {step['description']}"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Status:* {'✅ Valid' if is_valid else '❌ Invalid'}"
                    }
                }
            ]
            
            # Add feedback if provided
            if feedback:
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Feedback:*\n{feedback}"
                    }
                })
            
            # Add action buttons based on validation result
            if is_valid:
                blocks.append({
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Mark as Completed",
                                "emoji": True
                            },
                            "style": "primary",
                            "value": json.dumps({"step_id": step.get("id", "unknown"), "action": "complete"}),
                            "action_id": "complete_implementation"
                        }
                    ]
                })
            else:
                blocks.append({
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Retry Implementation",
                                "emoji": True
                            },
                            "style": "danger",
                            "value": json.dumps({"step_id": step.get("id", "unknown"), "action": "retry"}),
                            "action_id": "retry_implementation"
                        }
                    ]
                })
            
            # Send message
            response = self.client.chat_postMessage(
                channel=self.channel,
                text=f"Implementation Validation: {'Valid' if is_valid else 'Invalid'}",
                blocks=blocks
            )
            
            logger.info(f"Sent validation result to Slack: {response['ts']}")
            return response['ts']
        
        except SlackApiError as e:
            logger.error(f"Error sending validation result to Slack: {str(e)}")
            return None
    
    def update_message(self, ts: str, text: str, blocks: List[Dict] = None) -> bool:
        """
        Update an existing Slack message.
        
        Args:
            ts: Message timestamp
            text: New message text
            blocks: New message blocks
            
        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            logger.warning("No Slack client available. Message not updated.")
            return False
        
        try:
            kwargs = {
                "channel": self.channel,
                "ts": ts,
                "text": text
            }
            
            if blocks:
                kwargs["blocks"] = blocks
            
            self.client.chat_update(**kwargs)
            logger.info(f"Updated Slack message: {ts}")
            return True
        
        except SlackApiError as e:
            logger.error(f"Error updating Slack message: {str(e)}")
            return False

if __name__ == "__main__":
    # Example usage
    slack = SlackIntegration(channel="general")
    
    # Example implementation step
    step = {
        "id": "step1",
        "description": "Implement user authentication",
        "category": "functional",
        "completed": False
    }
    
    # Send implementation request
    slack.send_implementation_request(step, context="This is a high priority task.")
    
    # Send progress update
    completed_steps = [{"description": "Set up project structure", "completed": True}]
    pending_steps = [step, {"description": "Implement user profile page", "completed": False}]
    slack.send_progress_update(completed_steps, pending_steps)
    
    # Send validation result
    slack.send_validation_result(step, True, "Implementation looks good!")