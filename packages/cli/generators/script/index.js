// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const _ = require('lodash');
const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('script-generator');
const inspect = require('util').inspect;
const path = require('path');
const utils = require('../../lib/utils');

const SCRIPT_TEMPLATE = 'script-template.ts.ejs';

module.exports = class ScriptGenerator extends ArtifactGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.artifactInfo = {
      type: 'script',
      rootDir: utils.sourceRootDir,
    };

    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.scriptsDir,
    );

    this.artifactInfo.defaultTemplate = SCRIPT_TEMPLATE;

    return super._setupGenerator();
  }

  setOptions() {
    return super.setOptions();
  }

  checkLoopBackProject() {
    if (this.shouldExit()) return;
    return super.checkLoopBackProject();
  }

  /**
   * Ask for Service Name
   */
  async promptArtifactName() {
    debug('Prompting for script name');
    if (this.shouldExit()) return;

    if (this.options.name) {
      Object.assign(this.artifactInfo, {name: this.options.name});
    }

    const prompts = [
      {
        type: 'input',
        name: 'name',
        // capitalization
        message: utils.toClassName(this.artifactInfo.type) + ' name:',
        when: !this.artifactInfo.name,
        validate: utils.validateClassName,
      },
    ];
    return this.prompt(prompts).then(props => {
      Object.assign(this.artifactInfo, props);
      return props;
    });
  }

  scaffold() {
    if (this.shouldExit()) return false;

    // Setting up data for templates
    this.artifactInfo.className =
      utils.toClassName(this.artifactInfo.name) + 'Script';
    this.artifactInfo.fileName = utils.kebabCase(this.artifactInfo.name);

    Object.assign(this.artifactInfo, {
      outFile: utils.getScriptFileName(this.artifactInfo.name),
    });

    const source = this.templatePath(this.artifactInfo.defaultTemplate);

    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    debug(`artifactInfo: ${inspect(this.artifactInfo)}`);
    debug(`Copying artifact to: ${dest}`);

    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    return;
  }

  async end() {
    await super.end();
  }
};
