#!/bin/bash
# Install dependencies
pip install -r requirements.txt
# No need to run migrations as they will be run in the runtime
# This is a simple build script for Vercel 