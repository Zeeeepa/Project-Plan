import os
import re
import logging
import subprocess
from typing import Dict, List, Optional, Set, Tuple
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class GitHubAnalyzer:
    """
    Analyzes a GitHub repository to track implementation progress against requirements.
    """
    
    def __init__(self, repo_path: str = "."):
        """
        Initialize the GitHub analyzer.
        
        Args:
            repo_path: Path to the repository
        """
        self.repo_path = repo_path
        
    def get_recent_commits(self, days: int = 7) -> List[Dict]:
        """
        Get recent commits from the repository.
        
        Args:
            days: Number of days to look back
            
        Returns:
            List of commit dictionaries with sha, author, date, and message
        """
        since_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        
        try:
            # Get git log with formatted output
            cmd = [
                "git", "-C", self.repo_path, "log", 
                f"--since={since_date}", 
                "--pretty=format:%H|%an|%ad|%s", 
                "--date=iso"
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            commits = []
            for line in result.stdout.strip().split('\n'):
                if not line:
                    continue
                parts = line.split('|', 3)
                if len(parts) == 4:
                    sha, author, date, message = parts
                    commits.append({
                        "sha": sha,
                        "author": author,
                        "date": date,
                        "message": message
                    })
            
            logger.info(f"Found {len(commits)} recent commits")
            return commits
        except subprocess.CalledProcessError as e:
            logger.error(f"Error getting recent commits: {str(e)}")
            return []
    
    def get_changed_files(self, commit_sha: str) -> List[str]:
        """
        Get files changed in a specific commit.
        
        Args:
            commit_sha: Commit SHA
            
        Returns:
            List of changed file paths
        """
        try:
            cmd = ["git", "-C", self.repo_path, "show", "--name-only", "--pretty=format:", commit_sha]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            files = [f for f in result.stdout.strip().split('\n') if f]
            return files
        except subprocess.CalledProcessError as e:
            logger.error(f"Error getting changed files for commit {commit_sha}: {str(e)}")
            return []
    
    def get_file_content(self, file_path: str, commit_sha: Optional[str] = None) -> str:
        """
        Get content of a file at a specific commit.
        
        Args:
            file_path: Path to the file
            commit_sha: Optional commit SHA, if None gets the current version
            
        Returns:
            File content as string
        """
        try:
            if commit_sha:
                cmd = ["git", "-C", self.repo_path, "show", f"{commit_sha}:{file_path}"]
            else:
                with open(os.path.join(self.repo_path, file_path), 'r', encoding='utf-8') as f:
                    return f.read()
                
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            logger.error(f"Error getting content for file {file_path}: {str(e)}")
            return ""
    
    def analyze_implementation_progress(self, implementation_steps: List[Dict]) -> List[Dict]:
        """
        Analyze implementation progress based on repository content and commit history.
        
        Args:
            implementation_steps: List of implementation step dictionaries
            
        Returns:
            Updated implementation steps with completion status
        """
        # Get recent commits
        commits = self.get_recent_commits(days=30)  # Look back 30 days
        
        # Get all changed files from recent commits
        all_changed_files = set()
        commit_messages = []
        
        for commit in commits:
            changed_files = self.get_changed_files(commit["sha"])
            all_changed_files.update(changed_files)
            commit_messages.append(commit["message"])
        
        # Update implementation steps based on commit messages and changed files
        updated_steps = []
        
        for step in implementation_steps:
            step_description = step["description"].lower()
            step_completed = step["completed"]
            
            # Check if step is already marked as completed
            if step_completed:
                updated_steps.append(step)
                continue
            
            # Check commit messages for mentions of this step
            for message in commit_messages:
                # Extract keywords from step description
                keywords = self._extract_keywords(step_description)
                
                # Check if enough keywords are present in the commit message
                if self._has_enough_keywords(message.lower(), keywords):
                    step["completed"] = True
                    step["completion_method"] = "commit_message"
                    break
            
            # If still not marked as completed, check file contents
            if not step["completed"]:
                # For each relevant file, check if it contains implementation of this step
                for file_path in all_changed_files:
                    if not self._is_relevant_file(file_path):
                        continue
                    
                    file_content = self.get_file_content(file_path)
                    
                    # Extract keywords from step description
                    keywords = self._extract_keywords(step_description)
                    
                    # Check if enough keywords are present in the file content
                    if self._has_enough_keywords(file_content.lower(), keywords):
                        step["completed"] = True
                        step["completion_method"] = "file_content"
                        step["relevant_file"] = file_path
                        break
            
            updated_steps.append(step)
        
        # Log progress
        completed_count = sum(1 for step in updated_steps if step.get("completed", False))
        logger.info(f"Implementation progress: {completed_count}/{len(updated_steps)} steps completed")
        
        return updated_steps
    
    def _extract_keywords(self, text: str) -> Set[str]:
        """
        Extract keywords from text.
        
        Args:
            text: Text to extract keywords from
            
        Returns:
            Set of keywords
        """
        # Remove common words and keep only significant terms
        common_words = {
            "a", "an", "the", "and", "or", "but", "if", "then", "else", "when",
            "at", "from", "by", "for", "with", "about", "against", "between",
            "into", "through", "during", "before", "after", "above", "below",
            "to", "of", "in", "on", "is", "are", "was", "were", "be", "been",
            "being", "have", "has", "had", "do", "does", "did", "will", "would",
            "shall", "should", "may", "might", "must", "can", "could", "implement",
            "set", "up", "create", "add", "build", "develop", "make", "ui"
        }
        
        # Split text into words and filter out common words
        words = re.findall(r'\b\w+\b', text.lower())
        keywords = {word for word in words if word not in common_words and len(word) > 2}
        
        return keywords
    
    def _has_enough_keywords(self, text: str, keywords: Set[str], threshold: float = 0.5) -> bool:
        """
        Check if text contains enough keywords.
        
        Args:
            text: Text to check
            keywords: Set of keywords to look for
            threshold: Minimum fraction of keywords that must be present
            
        Returns:
            True if enough keywords are present, False otherwise
        """
        if not keywords:
            return False
        
        # Count how many keywords are present in the text
        present_keywords = sum(1 for keyword in keywords if keyword in text)
        
        # Check if the fraction of present keywords exceeds the threshold
        return present_keywords / len(keywords) >= threshold
    
    def _is_relevant_file(self, file_path: str) -> bool:
        """
        Check if a file is relevant for implementation analysis.
        
        Args:
            file_path: Path to the file
            
        Returns:
            True if the file is relevant, False otherwise
        """
        # Exclude certain file types and directories
        excluded_patterns = [
            r'\.git/',
            r'\.github/',
            r'node_modules/',
            r'__pycache__/',
            r'\.vscode/',
            r'\.idea/',
            r'\.DS_Store',
            r'\.env',
            r'\.log$',
            r'\.md$',
            r'\.json$',
            r'\.lock$',
            r'\.txt$',
            r'\.csv$',
            r'\.yml$',
            r'\.yaml$',
            r'\.toml$',
            r'\.ini$',
            r'\.cfg$'
        ]
        
        for pattern in excluded_patterns:
            if re.search(pattern, file_path):
                return False
        
        return True

if __name__ == "__main__":
    analyzer = GitHubAnalyzer()
    commits = analyzer.get_recent_commits()
    for commit in commits:
        print(f"{commit['sha'][:8]} - {commit['message']}")