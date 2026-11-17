import {Config} from '@remotion/cli/config';

Config.setChromiumOpenGlRenderer('swangle'); // troque para 'angle' numa máquina com GPU
Config.setBrowserExecutable('/opt/pw-browsers/chromium');
Config.setConcurrency(4);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setDelayRenderTimeoutInMilliseconds(180000);
