# Copyright (c) Alibaba, Inc. and its affiliates.
from modelscope.models.base import TorchModel
from modelscope.preprocessors.base import Preprocessor
from modelscope.pipelines.base import Model, Pipeline
from modelscope.utils.config import Config
from modelscope.pipelines.builder import PIPELINES
from modelscope.preprocessors.builder import PREPROCESSORS
from modelscope.models.builder import MODELS
from modelscope.outputs import OutputKeys

from yolov5_deps import *

@MODELS.register_module('domain-specific-object-detection', module_name='my-custom-model')
class MyCustomModel(TorchModel):

    def __init__(self, model_dir, *args, **kwargs):
        super().__init__(model_dir, *args, **kwargs)
        self.model = self.init_model(**kwargs)

    def forward(self, input_tensor, **forward_params):
        print("in forward")
        jpg_name = input_tensor
        if "http" in input_tensor :
            print("in http mode")
            import urllib.request
            save_path = self.model_dir + "/test.jpg"
            urllib.request.urlretrieve(input_tensor, save_path)
            jpg_name = save_path
            
        im0 = cv2.imread(jpg_name)
        print("im0 shape ", im0.shape, im0.shape[0])
        im = letterbox(im0)[0]  # padded resize
        print("im shape ", im.shape)
        im = im.transpose((2, 0, 1))[::-1]  # HWC to CHW, BGR to RGB
        im = np.ascontiguousarray(im)  # contiguous
        im = torch.from_numpy(im).to(torch.device("cuda:0"))
        im = im.float()  # uint8 to fp16/32
        im /= 255  # 0 - 255 to 0.0 - 1.0
        if len(im.shape) == 3:
            im = im[None]  # expand for batch dim
        print("img ", im.shape, im.device)
        y = self.iot_model(im)[0]
        print("y is ", y)
        #print("type:y ", type(y), type(y[0]), y[0].shape, type(y[1]))
        #print(y[1])
        y = non_max_suppression(y, 0.3, 0.5, classes=None, agnostic=False, \
                        cls_conf=None)
        print(y)
        det = y[0]
        gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]  # normalization gain whwh
        det[:, :4] = scale_coords(im.shape[2:], det[:, :4], im0.shape).round()
        
        scores_list = []
        bbox_list = []
        bbox_cls = []
        
        for *xyxy, conf, cls in det:
            x = xyxy[0].item()
            y = xyxy[1].item()
            x2 = xyxy[2].item()
            y2 = xyxy[3].item()
            bbox = [x, y, x2, y2]
            bbox_list.append(bbox)
            scores_list.append(conf.item())
            
            bbox_cls.append("ebike")

        outputs = {
            OutputKeys.SCORES: np.array(scores_list),
            OutputKeys.LABELS: bbox_cls,
            OutputKeys.BOXES: np.array(bbox_list)
        }
        print("outputs is ", outputs)
        return outputs

    def init_model(self, **kwargs):
        """Provide default implementation based on TorchModel and user can reimplement it.
            include init model and load ckpt from the model_dir, maybe include preprocessor
            if nothing to do, then return lambda x: x
        """
        print("wangjing")
        self.iot_model = attempt_load(
            self.model_dir + "/pytorch_model.pt",
            torch.device('cuda:0'))
        self.iot_model.float()
        for m in self.iot_model.modules():
            if isinstance(m, nn.Upsample):
                m.recompute_scale_factor = None
        return self.iot_model


@PREPROCESSORS.register_module('domain-specific-object-detection', module_name='my-custom-preprocessor')
class MyCustomPreprocessor(Preprocessor):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.trainsforms = self.init_preprocessor(**kwargs)

    def __call__(self, results):
        return self.trainsforms(results)

    def init_preprocessor(self, **kwarg):
        """ Provide default implementation based on preprocess_cfg and user can reimplement it.
            if nothing to do, then return lambda x: x
        """
        return lambda x: x


@PIPELINES.register_module('domain-specific-object-detection', module_name='my-custom-pipeline')
class MyCustomPipeline(Pipeline):
    """ Give simple introduction to this pipeline.

    Examples:

    >>> from modelscope.pipelines import pipeline
    >>> input = "Hello, ModelScope!"
    >>> my_pipeline = pipeline('my-task', 'my-model-id')
    >>> result = my_pipeline(input)

    """

    def __init__(self, model, preprocessor=None, **kwargs):
        """
        use `model` and `preprocessor` to create a custom pipeline for prediction
        Args:
            model: model id on modelscope hub.
            preprocessor: the class of method be init_preprocessor
        """
        super().__init__(model=model, auto_collate=False)
        assert isinstance(model, str) or isinstance(model, Model), \
            'model must be a single str or Model'
        if isinstance(model, str):
            pipe_model = Model.from_pretrained(model)
        elif isinstance(model, Model):
            pipe_model = model
        else:
            raise NotImplementedError
        pipe_model.eval()

        if preprocessor is None:
            preprocessor = MyCustomPreprocessor()
        super().__init__(model=pipe_model, preprocessor=preprocessor, **kwargs)

    def _sanitize_parameters(self, **pipeline_parameters):
        """
        this method should sanitize the keyword args to preprocessor params,
        forward params and postprocess params on '__call__' or '_process_single' method
        considered to be a normal classmethod with default implementation / output

        Default Returns:
            Dict[str, str]:  preprocess_params = {}
            Dict[str, str]:  forward_params = {}
            Dict[str, str]:  postprocess_params = pipeline_parameters
        """
        return {}, pipeline_parameters, {}

    def _check_input(self, inputs):
        pass

    def _check_output(self, outputs):
        pass

    def forward(self, inputs, **forward_params):
        """ Provide default implementation using self.model and user can reimplement it
        """
        return super().forward(inputs, **forward_params)

    def postprocess(self, inputs):
        """ If current pipeline support model reuse, common postprocess
            code should be write here.

        Args:
            inputs:  input data

        Return:
            dict of results:  a dict containing outputs of model, each
                output should have the standard output name.
        """
        return inputs


# Tips: usr_config_path is the temporary save configuration location， after upload modelscope hub, it is the model_id
usr_config_path = '/tmp/snapdown/'
config = Config({
    "framework": 'pytorch',
    "task": 'domain-specific-object-detection',
    "model": {'type': 'my-custom-model'},
    "pipeline": {"type": "my-custom-pipeline"},
    "allow_remote": True
})
config.dump('/tmp/snapdown/' + 'configuration.json')

if __name__ == "__main__":
    from modelscope.models import Model
    from modelscope.pipelines import pipeline
    # model = Model.from_pretrained(usr_config_path)
    input = "Hello, ModelScope!"
    inference = pipeline('domain-specific-object-detection', model=usr_config_path)
    output = inference(input)
    print(output)
