import {Config} from '@remotion/cli/config';

Config.setChromiumOpenGlRenderer('swangle');
Config.setBrowserExecutable('/opt/pw-browsers/chromium');
Config.setConcurrency(4);
