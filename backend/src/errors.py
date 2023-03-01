class Error(Exception):
    pass


class InferenceError(Error):
    pass


class InvalidInferenceModeError(InferenceError):
    pass


class CannotDetermineCausalEffectError(InferenceError):
    pass
