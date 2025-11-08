# LXCUS AI benchmark
This repro is a very simple set of tasks to benchmark how well an AI model can interact with a 
LXD/Incus server and the containers/VM's (refered to as "compute units") within them.

Before running the tasks check out the danger section below.

# Danger
 - We currently only support connecting over the local LXD/Incus socket, use a dedicated VM for this.
 - Compute units aren't isolated from the network.
 - AI will execute commands within compute units without human approval
 - The AI is able to list containers on the LXD/Incus host
 - The AI system prompts contain hints about reducing command output like "use apt -qq" this is because without it context grows very large
 - The same AI model, with fresh context, is used to judge some answers.
 - Not using MCP

# Running the tasks
 - Create a compute unit install LXD/Incus, and node>=20
 - Clone this repo `git clone https://github.com/turtle0x1/lxus_ai_benchmark`
 - Run `npm install` && `npm link`
 - Move `.env.dist` to `.env` and fill out the required values
 - Run various commands;
  - Get help / list all tasks `lxus_ai_bench`
  - Run one task `lxus_ai_bench --task="api/list/simple_units"`
  - Run all tasks `lxus_ai_bench --run-all`


# Writing a task
Tasks are stored stored in the `tasks/` folder which is sperated into three folders;

 - `api` (controlling LXD/Incus itself)
 - `icu` (interacting with running containers/virtual machines)
 - `private` (tasks not released publicly)

The simplest task to copy is `tasks/icu/files/cat.js` as it demonstrates launching
a instance, seeding it with a file, and juding the AI's final answer.

The task to install php + apache in `tasks/icu/php/install_with_apache.js` demonstrates how
you can execute a command inside a compute unit to check out the state of things at the end.

Tasks should be written pretty lazily and not over speically use "hints" to guide the model.

# Task Hints
Task hints controlled by the `.env` variable `USE_HINTS`, hints are human generated notes passed to the AI model to help it not fail.

The hints are usually dervied from a human watching how an AI model performs a task over 2/3 runs and seeing where it ofen gets stuck.
  
