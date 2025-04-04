#!/usr/bin/env python3
import os
import sys
import argparse
import logging
from typing import Dict, List, Optional

from .clean_coder_planner import CleanCoderPlanner

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def parse_args():
    """
    Parse command-line arguments.
    
    Returns:
        Parsed arguments
    """
    parser = argparse.ArgumentParser(description="Clean Coder AI Integration for Project Planning")
    
    # Main command subparsers
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Analyze command
    analyze_parser = subparsers.add_parser("analyze", help="Analyze requirements and generate implementation plan")
    analyze_parser.add_argument("--docs-folder", default="docs", help="Path to documentation folder")
    analyze_parser.add_argument("--output-folder", default="implementation_plans", help="Path to output folder")
    
    # Update command
    update_parser = subparsers.add_parser("update", help="Update implementation progress")
    update_parser.add_argument("--docs-folder", default="docs", help="Path to documentation folder")
    update_parser.add_argument("--output-folder", default="implementation_plans", help="Path to output folder")
    
    # Send command
    send_parser = subparsers.add_parser("send", help="Send implementation request or progress update")
    send_parser.add_argument("--type", choices=["request", "progress"], required=True, help="Type of message to send")
    send_parser.add_argument("--docs-folder", default="docs", help="Path to documentation folder")
    send_parser.add_argument("--output-folder", default="implementation_plans", help="Path to output folder")
    send_parser.add_argument("--slack-channel", help="Slack channel to send messages to")
    
    # Run command
    run_parser = subparsers.add_parser("run", help="Run planning cycle or continuous loop")
    run_parser.add_argument("--mode", choices=["once", "loop"], default="once", help="Run mode")
    run_parser.add_argument("--interval", type=int, default=30, help="Interval between planning cycles in minutes (for loop mode)")
    run_parser.add_argument("--docs-folder", default="docs", help="Path to documentation folder")
    run_parser.add_argument("--output-folder", default="implementation_plans", help="Path to output folder")
    run_parser.add_argument("--slack-channel", help="Slack channel to send messages to")
    
    return parser.parse_args()

def main():
    """
    Main entry point for the CLI.
    """
    args = parse_args()
    
    if not args.command:
        print("Error: No command specified. Use --help for usage information.")
        sys.exit(1)
    
    # Get Slack token from environment variable
    slack_token = os.environ.get("SLACK_API_TOKEN")
    
    # Initialize planner
    planner = CleanCoderPlanner(
        docs_folder=args.docs_folder,
        repo_path=".",
        output_folder=args.output_folder,
        slack_channel=getattr(args, "slack_channel", None),
        slack_token=slack_token
    )
    
    # Execute command
    if args.command == "analyze":
        steps = planner.analyze_requirements()
        plan_file = planner.save_implementation_plan()
        print(f"Generated {len(steps)} implementation steps")
        print(f"Saved implementation plan to {plan_file}")
    
    elif args.command == "update":
        if not planner.implementation_steps:
            planner.analyze_requirements()
        
        completed_steps, pending_steps = planner.update_implementation_progress()
        print(f"Implementation progress: {len(completed_steps)}/{len(completed_steps) + len(pending_steps)} steps completed")
    
    elif args.command == "send":
        if not planner.implementation_steps:
            planner.analyze_requirements()
            planner.update_implementation_progress()
        
        if args.type == "request":
            step = planner.send_next_implementation_request()
            if step:
                print(f"Sent implementation request for: {step['description']}")
            else:
                print("No pending steps to implement")
        
        elif args.type == "progress":
            message_ts = planner.send_progress_update()
            if message_ts:
                print(f"Sent progress update to Slack")
            else:
                print("Failed to send progress update")
    
    elif args.command == "run":
        if args.mode == "once":
            planner.run_planning_cycle()
            print("Planning cycle completed")
        
        elif args.mode == "loop":
            print(f"Starting continuous planning loop with {args.interval} minute interval...")
            try:
                planner.run_continuous_loop(interval_minutes=args.interval)
            except KeyboardInterrupt:
                print("\nPlanning loop interrupted by user")
                sys.exit(0)

if __name__ == "__main__":
    main()