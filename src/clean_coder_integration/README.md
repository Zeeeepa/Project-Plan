# Clean Coder Integration

This module integrates Clean-Coder-AI's planning functionality with Project-Plan to analyze requirements, create step-by-step implementation plans, track progress, and communicate via Slack.

## Features

- **Requirements Analysis**: Extracts structured requirements from documentation files
- **Implementation Planning**: Generates step-by-step implementation plans
- **GitHub Integration**: Tracks implementation progress by analyzing repository changes
- **Slack Communication**: Sends implementation requests and progress updates via Slack
- **Continuous Monitoring**: Runs in a loop to continuously track progress and send updates

## Usage

### Command Line Interface

The module provides a command-line interface for easy usage:

```bash
# Analyze requirements and generate implementation plan
python -m src.clean_coder_integration.cli analyze --docs-folder docs --output-folder implementation_plans

# Update implementation progress
python -m src.clean_coder_integration.cli update

# Send implementation request
python -m src.clean_coder_integration.cli send --type request --slack-channel project-updates

# Send progress update
python -m src.clean_coder_integration.cli send --type progress --slack-channel project-updates

# Run a single planning cycle
python -m src.clean_coder_integration.cli run --mode once --slack-channel project-updates

# Run a continuous planning loop
python -m src.clean_coder_integration.cli run --mode loop --interval 30 --slack-channel project-updates
```

### Environment Variables

The following environment variables are used:

- `SLACK_API_TOKEN`: Slack API token for sending messages
- `AWS_REGION`: AWS region for accessing secrets (optional)
- `SLACK_AUTOMATION_BOT`: Name of the AWS Secrets Manager secret containing Slack credentials (optional)

### Programmatic Usage

You can also use the module programmatically:

```python
from src.clean_coder_integration.clean_coder_planner import CleanCoderPlanner

# Initialize planner
planner = CleanCoderPlanner(
    docs_folder="docs",
    repo_path=".",
    output_folder="implementation_plans",
    slack_channel="project-updates"
)

# Analyze requirements
planner.analyze_requirements()

# Update implementation progress
completed_steps, pending_steps = planner.update_implementation_progress()

# Send implementation request
planner.send_next_implementation_request()

# Send progress update
planner.send_progress_update()

# Run a complete planning cycle
planner.run_planning_cycle()

# Run a continuous loop
planner.run_continuous_loop(interval_minutes=30)
```

## Components

- `requirements_analyzer.py`: Analyzes documentation files to extract requirements
- `github_analyzer.py`: Analyzes GitHub repository to track implementation progress
- `slack_integration.py`: Handles communication with Slack
- `clean_coder_planner.py`: Main integration class that combines all components
- `cli.py`: Command-line interface for the integration

## Implementation Plans

Implementation plans are saved as markdown files in the specified output folder. Each plan includes:

- Generated timestamp
- Categorized implementation steps
- Completion status for each step

Example:

```markdown
# Implementation Plan

Generated: 2025-04-04 18:30:45

## Functional Implementation

[x] Implement user authentication
[ ] Implement user profile management
[ ] Implement project creation and management

## Technical Implementation

[x] Set up database schema
[ ] Implement API endpoints
[ ] Set up CI/CD pipeline
```

## Slack Integration

The integration sends the following types of messages to Slack:

1. **Implementation Requests**: Detailed task descriptions with context and action buttons
2. **Progress Updates**: Overview of completed and pending tasks with progress percentage
3. **Validation Results**: Results of implementation validation with feedback and action buttons