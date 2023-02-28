class Error(Exception):
    pass


class InvalidInferenceModeError(Error):
    pass


class CannotDetermineCausalEffectError(Error):
    pass
