const core = require('@actions/core');
//const io = require('@actions/io')
//const tc = require('@actions/tool-cache')
const exec = require('@actions/exec')
//const artifact = require('@actions/artifact')
//const github = require('@actions/github');

async function clone_ampyfier() {
    core.info("Cloning AmPyfier")
    const ampyfier_token = core.getInput("token")
    await exec.exec("git clone https://" + ampyfier_token + "@github.com/schoofsebert/AmPyfier")
    await exec.exec("ls AmPyfier")
}

async function setup_python(python) {
    if (core.getInput("python-version") !== "3.8") {
        await exec.exec("sudo add-apt-repository ppa:deadsnakes/ppa");
        await exec.exec("sudo apt-get -y update");
        await exec.exec("sudo apt-get -y install " + python + " " + python +"-dev " + python + "-venv " + python + "-distutils");
        await exec.exec(python + " -m ensurepip");
    }
    else {
        await exec.exec("sudo apt-get -y install " + python + " " + python +"-dev " + python+"-pip");

    }
}

async function setup_ampyfier(python) {
    if (core.getInput("python-version") !== "3.10") {
        await exec.exec(python + " -m pip install --upgrade pip");
    }
    else {
        await exec.exec('/bin/bash -c "curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10"')
    }
    await exec.exec(python + " -m pip install AmPyfier");
}

async function setup() {
    let python = "python"
    if (core.getInput("python-version") !== "3.8") {
        python += core.getInput("python-version")
    }
    else {
        python += "3"
    }
    await setup_python(python);
    await setup_ampyfier(python);
}

async function run_ampyfier(project_dir, test, arguments) {
    await exec.exec("ampyfier -p " + project_dir + " -t " + test + " " + arguments);
}

async function amplify() {
    let project_dir = core.getInput("project_dir")
    let test = core.getInput("test")
    let arguments = core.getInput("arguments")
    await run_ampyfier(project_dir, test, arguments);
}

async function main() {
    await clone_ampyfier();
    await setup();
    await amplify();
}

main();