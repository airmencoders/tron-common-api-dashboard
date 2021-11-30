import React from 'react';
import { shortenString } from '../string-utils';


describe('string util tests', () => {

  it('should shorten string', () => {
    expect(shortenString(null)).toEqual('');
    expect(shortenString(undefined)).toEqual('');    
    expect(shortenString('')).toEqual('');    
    expect(shortenString('someoklenstring!.txt')).toEqual('someoklenstring!.txt');    
    expect(shortenString('somefile.withverylongcrazyextension')).toEqual('s...e.withverylongcr');    
    expect(shortenString('somereallyreallylongfilename.txt')).toEqual('somereallyrea...e.txt');
    expect(shortenString('somereallyreallylongfilenamenoextension')).toEqual('somereallyreallyl...');
    expect(shortenString('somereallyreally.ong.ilename.txt')).toEqual('somereallyrea...e.txt');
  });
})