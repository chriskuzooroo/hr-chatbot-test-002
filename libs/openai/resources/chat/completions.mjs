// File generated from our OpenAPI spec by Stainless.
import { APIResource } from 'openai/resource';
export class Completions extends APIResource {
  create(body, options) {
    var _a;
    return this.post('/chat/completions', {
      body,
      ...options,
      stream: (_a = body.stream) !== null && _a !== void 0 ? _a : false,
    });
  }
}
(function (Completions) {})(Completions || (Completions = {}));
//# sourceMappingURL=completions.mjs.map
