/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// NOTE: Only to be invoked from blink_idl_import.sh.

var env = require('process').env;
var idlFiles = env.IDL_FILES.split('\n').map(function(path) {
  return env.BLINK_SRC_DIR + '/' + path;
});

var stringify = require('ya-stdlib-js').stringify;

var fs = require('fs');
function loadFiles(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] = {
      path: arr[i],
      contents: fs.readFileSync(arr[i]).toString(),
    };
  }
  return arr;
}

var data = loadFiles(idlFiles);

var parser = require('webidl2-js');

var errCount = 0;
var parses = [];
data.forEach(function(datum) {
  try {
    var res = parser.parseString(datum.contents);
    if (res[0]) {
      parses = parses.concat(res[1]);
    } else {
      errCount++;
      console.warn('Incomplete parse from', datum.path);
    }
  } catch (e) {
    errCount++;
    console.warn('Exception thrown parsing', datum.path);
  }
});

fs.writeFileSync(env.WEB_APIS_DIR + '/data/idl/blink/all.json',
                 stringify(parses));

console.log('Wrote', parses.length, 'IDL fragments from', idlFiles.length,
            'files. Encountered', errCount, 'errors');
