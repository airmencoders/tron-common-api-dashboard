import React from 'react';
import DownloadFile from '../download-file-util';

describe('Download File Util Test', () => {
  it('should error out with a falsy filename', async () => {
    global.window = Object.create(window);
    global.document = { location: '' } as any;

    DownloadFile('', true, Promise.resolve());

    // no new insertions in the DOM
    expect(Object.keys(global.document)).toHaveLength(1);
  });

  it('should create a temporary <a> tag to download a file', async () => {
    const clickable = jest.fn();
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as unknown) as any);
    jest.spyOn(document, 'createElement').mockReturnValue({
      click: clickable,
      parentNode: {
        removeChild: function () {} as any,
      } as any,
      setAttribute: function () {},
    } as any);
    
    global.window = Object.create(window);
    window.URL = {
      createObjectURL: function (obj: Blob) {
        return 'http://dso.mil';
      },
    } as any;

    await DownloadFile('file.txt', true, Promise.resolve('http://dso.mil'));
    expect(clickable).toBeCalledTimes(1);
  });
});
