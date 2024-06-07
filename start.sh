#!/usr/bin/env bash

# tmux new-session -d 'bash'
# tmux split-window -h 'fish'
# tmux split-window -h

tmux new-session -d "bash -c 'cd frontend && npm run dev'"
tmux split-window -h "bash -c 'cd serialport && sudo npm start && cat'"

tmux -2 attach-session -d
