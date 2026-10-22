export function modelTranslator({load=()=>import('@huggingface/transformers'),onProgress=()=>{}}={}){
 return {async create({sourceLanguage,targetLanguage}){
  const {pipeline,env}=await load();
  env.allowLocalModels=false;
  const model=sourceLanguage==='pt'?'Xenova/opus-mt-ROMANCE-en':'Xenova/opus-mt-en-ROMANCE';
  const pipe=await pipeline('translation',model,{device:'wasm',dtype:'q8',progress_callback:onProgress});
  return {async translate(text){
   const input=targetLanguage==='pt'?`>>pt_BR<< ${text}`:text;
   const result=await pipe(input,{max_new_tokens:256});
   if(!result?.[0]?.translation_text)throw Error('MODEL_OUTPUT_EMPTY');
   return result[0].translation_text;
  }};
 }};
}
