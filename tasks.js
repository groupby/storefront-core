import commands from 're-start/presets/typescript';
import clean from 'start-clean';
import env from 'start-env';
import files from 'start-files';
import webpack from 'start-webpack';

module.exports = commands;

function bundle(environment, watch = false) {
  return () => commands.start(
    env('NODE_ENV', environment),
    files('bundle/'),
    clean(),
    webpack({ ...require('./webpack.config'), watch })
  );
};

commands['bundle'] = commands['bundle:prod'] = bundle('production');
commands['bundle:dev'] = bundle('development');
commands['bundle:watch'] = bundle('development', true);
