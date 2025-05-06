import {
  TTSModelType,
  ChatModelItemType,
  FunctionModelItemType,
  LLMModelItemType,
  RerankModelItemType,
  EmbeddingModelItemType,
  STTModelType
} from '@fastgpt/global/core/ai/model.d';
import { TrackEventName } from '@/web/common/system/constants';

declare global {
  var qaQueueLen: number;
  var vectorQueueLen: number;

  interface Window {
    grecaptcha: any;
    QRCode: any;
    umami?: {
      track: (event: TrackEventName, data: any) => void;
    };
  }
}
