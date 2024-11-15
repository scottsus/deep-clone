import logging
import os
import sys
import traceback
from typing import Union


class PrettyFormatter(logging.Formatter):
    green = "\x1b[32;1m"
    blue = "\x1b[34;1m"
    yellow = "\x1b[33;20m"
    orange = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format = "[%(asctime)s] [%(levelname)-8s] --- %(message)s (%(filename)s:%(lineno)s)"

    FORMATS = {
        logging.DEBUG: green + format + reset,
        logging.INFO: blue + format + reset,
        logging.WARNING: yellow + format + reset,
        logging.ERROR: orange + format + reset,
        logging.CRITICAL: bold_red + format + reset,
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        date_format = "%Y-%m-%d %H:%M:%S"
        formatter = logging.Formatter(log_fmt, date_format)
        formatted = formatter.format(record)

        if record.levelno in (logging.WARN, logging.ERROR, logging.CRITICAL):
            formatted += "\n" + traceback.format_exc()

        return formatted


def get_logger(name: str, log_level: Union[int, None] = None):
    """
    Using loggers in python can be very confusing.

    Often times even after setLevel(logging.DEBUG), logger.debug() still fails
    to reveal anything to the console.

    REMEMBER TO SET ENV="dev" IN YOUR .env
    """
    env = os.environ.get("ENV")
    LOG_LEVEL = (
        logging.WARN
        if env.lower() != "dev"
        else log_level if log_level is not None else logging.INFO
    )

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(PrettyFormatter())
    console_handler.setLevel(LOG_LEVEL)

    logger = logging.getLogger(name)
    logger.addHandler(console_handler)
    logger.setLevel(LOG_LEVEL)

    return logger
