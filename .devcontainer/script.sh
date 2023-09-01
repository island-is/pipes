#!/bin/sh
git config pull.rebase true
git config branch.autosetuprebase always
yarn config set --home enableTelemetry 0