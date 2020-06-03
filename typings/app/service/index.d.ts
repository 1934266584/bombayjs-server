// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportActionToken from '../../../app/service/actionToken';
import ExportDimension from '../../../app/service/dimension';
import ExportEventVariate from '../../../app/service/eventVariate';
import ExportGroup from '../../../app/service/group';
import ExportMeasure from '../../../app/service/measure';
import ExportPageVariate from '../../../app/service/pageVariate';
import ExportProject from '../../../app/service/project';
import ExportTransferJava from '../../../app/service/transferJava';
import ExportUser from '../../../app/service/user';
import ExportWebBase from '../../../app/service/web/base';
import ExportWebError from '../../../app/service/web/error';
import ExportWebReport from '../../../app/service/web/report';
import ExportWebRetcode from '../../../app/service/web/retcode';

declare module 'egg' {
  interface IService {
    actionToken: AutoInstanceType<typeof ExportActionToken>;
    dimension: AutoInstanceType<typeof ExportDimension>;
    eventVariate: AutoInstanceType<typeof ExportEventVariate>;
    group: AutoInstanceType<typeof ExportGroup>;
    measure: AutoInstanceType<typeof ExportMeasure>;
    pageVariate: AutoInstanceType<typeof ExportPageVariate>;
    project: AutoInstanceType<typeof ExportProject>;
    transferJava: AutoInstanceType<typeof ExportTransferJava>;
    user: AutoInstanceType<typeof ExportUser>;
    web: {
      base: AutoInstanceType<typeof ExportWebBase>;
      error: AutoInstanceType<typeof ExportWebError>;
      report: AutoInstanceType<typeof ExportWebReport>;
      retcode: AutoInstanceType<typeof ExportWebRetcode>;
    }
  }
}
