import { DocumentDto } from '../../openapi';
import { formatBytesToString, getPathFileName, joinPathParts, reduceDocumentDtoListToUnique } from '../file-utils';

describe('File Utils Test', () => {
  it('should return formatted string from number of bytes', () => {
    expect(formatBytesToString(1024)).toEqual('1 KB');
    expect(formatBytesToString(Math.pow(1024, 2))).toEqual('1 MB');
    expect(formatBytesToString(Math.pow(1024, 3))).toEqual('1 GB');
    expect(formatBytesToString(Math.pow(1024, 4))).toEqual('1 TB');
    expect(formatBytesToString(Math.pow(1024, 5))).toEqual('1 PB');
    expect(formatBytesToString(Math.pow(1024, 6))).toEqual('1 EB');
    expect(formatBytesToString(Math.pow(1024, 7))).toEqual('1 ZB');
    expect(formatBytesToString(Math.pow(1024, 8))).toEqual('1 YB');
  });

  it('should reduce a list of DocumentDtos of various spaces and paths', () => {
    const docsList: Partial<DocumentDto>[] = [
      { spaceId: '1', path: '/s', key: 'chris' },
      { spaceId: '1', path: '/s', key: 'nolan' },
      { spaceId: '1', path: '/s/folder', key: '45' },
      { spaceId: '2', path: '/s', key: '23' },
      { spaceId: '2', path: '/s/t/u', key: 'heather' },
      { spaceId: '3', path: '/s/t/u', key: 'nora' },
    ];

    // should uniq the collection to just 5 elements (first element having 2 items in its items field)
    expect(reduceDocumentDtoListToUnique(docsList as DocumentDto[])).toHaveLength(5);
    expect(reduceDocumentDtoListToUnique(docsList as DocumentDto[])[0].items).toHaveLength(2);
    expect(reduceDocumentDtoListToUnique([])).toHaveLength(0);
    expect(reduceDocumentDtoListToUnique(null!)).toHaveLength(0);
  });

  it('should create suitable paths', () => {
    expect(joinPathParts('', 'documents.txt')).toEqual('/documents.txt');
    expect(joinPathParts('home/directory/', 'documents.txt')).toEqual('home/directory/documents.txt');
    expect(joinPathParts('home/directory', 'documents.txt')).toEqual('home/directory/documents.txt');
    expect(joinPathParts('home/directory', 'documents.txt/')).toEqual('home/directory/documents.txt');
    expect(joinPathParts('home/directory', 'documents.txt////')).toEqual('home/directory/documents.txt');
  });

  it('should give the filename part of a path', () => {
    expect(getPathFileName('/some/docs/file.txt')).toEqual('file.txt');
    expect(getPathFileName('file.txt')).toEqual('file.txt');
    expect(getPathFileName('/file.txt')).toEqual('file.txt');
  })
});
