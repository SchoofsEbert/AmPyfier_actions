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
    if (core.getInput("python-version") !== "3.10") {
        await exec.exec(python + " -m pip install --upgrade pip");
    }
    else {
        await exec.exec('/bin/bash -c "curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10"')
    }
}

async function setup_ampyfier(python) {
    await exec.exec(python + " -m pip install ./AmPyfier");
}

async function setup() {
    let python = "python"
    if (core.getInput("python-version") !== "") {
        if (core.getInput("python-version") !== "3.8") {
            python += core.getInput("python-version")
        } else {
            python += "3"
        }
        await setup_python(python);
    }
    await setup_ampyfier(python);
}

async function create_diff_file(start_commit, end_commit) {
    core.info("Creating diff file")
    await exec.exec(`ls ${__dirname}/..`)
    let diff_script = `${__dirname}/../diff_scripts/git-diff-changed-lines.sh`
    await exec.exec('/bin/bash -c "' + diff_script + ' '  + start_commit + ' ' + end_commit + '  > ampyfier_diff"')
    await exec.exec("cat ampyfier_diff")
}

async function run_ampyfier(python_path, project_dir, test, arguments) {
    try {
        await exec.exec('/bin/bash -c "PYTHONPATH=$PWD/' + python_path + ' ampyfier -p ' + project_dir + ' -t ' + test + ' ' + arguments + '"')
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

async function amplify() {
    let project_dir = core.getInput("project_dir")
    let test = core.getInput("test")
    let arguments = core.getInput("arguments")
    let start_commit = core.getInput("start_commit")
    let end_commit = core.getInput("end_commit")
    let python_path = core.getInput("python_path")
    if (start_commit.length > 0 && end_commit.length > 0) {
        await create_diff_file(start_commit, end_commit)
        arguments += " -d ampyfier_diff"
    }
    else if ((start_commit.length > 0 && end_commit.length  === 0) || (start_commit.length === 0 && end_commit.length  > 0)) {
        core.warning("You need to give both a start and end commit to amplify on differences")
    }
    await run_ampyfier(python_path, project_dir, test, arguments);
}

async function main() {
    await clone_ampyfier();
    await setup();
    await amplify();
}

main();