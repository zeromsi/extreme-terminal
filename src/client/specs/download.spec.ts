/* eslint-disable */

import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import { JSDOM } from 'jsdom';
import { FileDownloader } from '../download';

const { window } = new JSDOM(`...`);

describe('FileDownloader', () => {
    const FILE_BEGIN = 'BEGIN';
    const FILE_END = 'END';
    let fileDownloader: any;

    beforeEach(() => {
        fileDownloader = new FileDownloader(() => { }, FILE_BEGIN, FILE_END);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return data before file markers', () => {
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');
        expect(
            fileDownloader.buffer(`DATA AT THE LEFT${FILE_BEGIN}FILE${FILE_END}`)
        ).to.equal('DATA AT THE LEFT');
        expect(onCompleteFileStub.calledOnce).to.be.true;
        expect(onCompleteFileStub.getCall(0).args[0]).to.equal('FILE');
    });

    it('should return data after file markers', () => {
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');
        expect(
            fileDownloader.buffer(`${FILE_BEGIN}FILE${FILE_END}DATA AT THE RIGHT`)
        ).to.equal('DATA AT THE RIGHT');
        expect(onCompleteFileStub.calledOnce).to.be.true;
        expect(onCompleteFileStub.getCall(0).args[0]).to.equal('FILE');
    });

    it('should return data before and after file markers', () => {
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');
        expect(
            fileDownloader.buffer(
                `DATA AT THE LEFT${FILE_BEGIN}FILE${FILE_END}DATA AT THE RIGHT`
            )
        ).to.equal('DATA AT THE LEFTDATA AT THE RIGHT');
        expect(onCompleteFileStub.calledOnce).to.be.true;
        expect(onCompleteFileStub.getCall(0).args[0]).to.equal('FILE');
    });

    it('should return data before a beginning marker found', () => {
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');
        expect(fileDownloader.buffer(`DATA AT THE LEFT${FILE_BEGIN}FILE`)).to.equal(
            'DATA AT THE LEFT'
        );
    });

    it('should return data after an ending marker found', () => {
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');
        expect(fileDownloader.buffer(`${FILE_BEGIN}FI`)).to.equal('');
        expect(fileDownloader.buffer(`LE${FILE_END}DATA AT THE RIGHT`)).to.equal(
            'DATA AT THE RIGHT'
        );
        expect(onCompleteFileStub.calledOnce).to.be.true;
        expect(onCompleteFileStub.getCall(0).args[0]).to.equal('FILE');
    });

    it('should buffer across incomplete file begin marker sequence on two calls', () => {
        fileDownloader = new FileDownloader(() => { }, 'BEGIN', 'END');
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');

        expect(fileDownloader.buffer('BEG')).to.equal('');
        expect(fileDownloader.buffer('INFILEEND')).to.equal('');
        expect(onCompleteFileStub.calledOnce).to.be.true;
        expect(onCompleteFileStub.getCall(0).args[0]).to.equal('FILE');
    });

    it('should buffer across incomplete file begin marker sequence on n calls', () => {
        fileDownloader = new FileDownloader(() => { }, 'BEGIN', 'END');
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');

        expect(fileDownloader.buffer('B')).to.equal('');
        expect(fileDownloader.buffer('E')).to.equal('');
        expect(fileDownloader.buffer('G')).to.equal('');
        expect(fileDownloader.buffer('I')).to.equal('');
        expect(fileDownloader.buffer('NFILE' + 'END')).to.equal('');
        expect(onCompleteFileStub.calledOnce).to.be.true;
        expect(onCompleteFileStub.getCall(0).args[0]).to.equal('FILE');
    });

    it('should buffer across incomplete file begin marker sequence with data on the left and right on multiple calls', () => {
        fileDownloader = new FileDownloader(() => { }, 'BEGIN', 'END');
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');

        expect(fileDownloader.buffer('DATA AT THE LEFT' + 'B')).to.equal(
            'DATA AT THE LEFT'
        );
        expect(fileDownloader.buffer('E')).to.equal('');
        expect(fileDownloader.buffer('G')).to.equal('');
        expect(fileDownloader.buffer('I')).to.equal('');
        expect(fileDownloader.buffer('NFILE' + 'ENDDATA AT THE RIGHT')).to.equal(
            'DATA AT THE RIGHT'
        );
        expect(onCompleteFileStub.calledOnce).to.be.true;
        expect(onCompleteFileStub.getCall(0).args[0]).to.equal('FILE');
    });

    it('should buffer across incomplete file begin marker sequence then handle false positive', () => {
        fileDownloader = new FileDownloader(() => { }, 'BEGIN', 'END');
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');

        expect(fileDownloader.buffer('DATA AT THE LEFT' + 'B')).to.equal(
            'DATA AT THE LEFT'
        );
        expect(fileDownloader.buffer('E')).to.equal('');
        expect(fileDownloader.buffer('G')).to.equal('');
        // This isn't part of the file_begin marker and should trigger the partial
        // file begin marker to be returned with the normal data
        expect(fileDownloader.buffer('ZDATA AT THE RIGHT')).to.equal(
            'BEGZDATA AT THE RIGHT'
        );
        expect(onCompleteFileStub.called).to.be.false;
    });

    it('should buffer across incomplete file end marker sequence on two calls', () => {
        fileDownloader = new FileDownloader(() => { }, 'BEGIN', 'END');
        const mockFilePart1 = 'DATA AT THE LEFTBEGINFILEE';
        const mockFilePart2 = 'NDDATA AT THE RIGHT';

        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');
        expect(fileDownloader.buffer(mockFilePart1)).to.equal('DATA AT THE LEFT');
        expect(fileDownloader.buffer(mockFilePart2)).to.equal('DATA AT THE RIGHT');

        expect(onCompleteFileStub.calledOnce).to.be.true;
        expect(onCompleteFileStub.getCall(0).args[0]).to.equal('FILE');
    });

    it('should buffer across incomplete file end and file begin marker sequence with data on the left and right on multiple calls', () => {
        fileDownloader = new FileDownloader(() => { }, 'BEGIN', 'END');
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');

        expect(fileDownloader.buffer('DATA AT THE LEFT' + 'BE')).to.equal(
            'DATA AT THE LEFT'
        );
        expect(fileDownloader.buffer('G')).to.equal('');
        expect(fileDownloader.buffer('I')).to.equal('');
        expect(fileDownloader.buffer('NFILEE')).to.equal('');
        expect(fileDownloader.buffer('N')).to.equal('');
        expect(fileDownloader.buffer('DDATA AT THE RIGHT')).to.equal(
            'DATA AT THE RIGHT'
        );
        expect(onCompleteFileStub.calledOnce).to.be.true;
        expect(onCompleteFileStub.getCall(0).args[0]).to.equal('FILE');
    });

    it('should be able to handle multiple files', () => {
        fileDownloader = new FileDownloader(() => { }, 'BEGIN', 'END');
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');

        expect(
            fileDownloader.buffer(
                'DATA AT THE LEFT' + 'BEGIN' + 'FILE1' + 'END' + 'SECOND DATA' + 'BEGIN'
            )
        ).to.equal('DATA AT THE LEFT' + 'SECOND DATA');
        expect(onCompleteFileStub.calledOnce).to.be.true;
        expect(onCompleteFileStub.getCall(0).args[0]).to.equal('FILE1');

        expect(fileDownloader.buffer('FILE2')).to.equal('');
        expect(fileDownloader.buffer('E')).to.equal('');
        expect(fileDownloader.buffer('NDRIGHT')).to.equal('RIGHT');
        expect(onCompleteFileStub.calledTwice).to.be.true;
        expect(onCompleteFileStub.getCall(1).args[0]).to.equal('FILE2');
    });

    it('should be able to handle multiple files with an ending marker', () => {
        fileDownloader = new FileDownloader(() => { }, 'BEGIN', 'END');
        const onCompleteFileStub = sinon.stub(fileDownloader, 'onCompleteFile');

        expect(
            fileDownloader.buffer('DATA AT THE LEFT' + 'BEGIN' + 'FILE1' + 'EN')
        ).to.equal('DATA AT THE LEFT');
        expect(onCompleteFileStub.calledOnce).to.be.false;
        expect(
            fileDownloader.buffer('D' + 'SECOND DATA' + 'BEGIN' + 'FILE2' + 'EN')
        ).to.equal('SECOND DATA');
        expect(onCompleteFileStub.calledOnce).to.be.true;
        expect(onCompleteFileStub.getCall(0).args[0]).to.equal('FILE1');
        expect(fileDownloader.buffer('D')).to.equal('');
        expect(onCompleteFileStub.calledTwice).to.be.true;
        expect(onCompleteFileStub.getCall(1).args[0]).to.equal('FILE2');
    });
});