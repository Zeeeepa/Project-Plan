from setuptools import setup, find_packages

setup(
    name="clean_coder_integration",
    version="0.1.0",
    description="Integration of Clean-Coder-AI planning functionality with Project-Plan",
    author="Zeeeepa",
    author_email="info@example.com",
    packages=find_packages(),
    install_requires=[
        "slack_sdk>=3.0.0",
        "boto3>=1.20.0",
    ],
    entry_points={
        "console_scripts": [
            "clean-coder-planner=src.clean_coder_integration.cli:main",
        ],
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
    ],
)