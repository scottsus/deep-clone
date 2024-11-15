import json
import os
from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, List, Union

import jsonschema
import jsonschema.exceptions
from anthropic import Anthropic as AnthropicClient
from jsonschema import validate
from openai import OpenAI as OpenAIClient
from pydantic import BaseModel
from tenacity import retry, retry_if_exception_type, stop_after_attempt


class Role(Enum):
    USER = "user"
    CLONE = "clone"


class Message:
    def __init__(self):
        self.role: Role
        self.content: str


class LLM(ABC):
    @abstractmethod
    def respond(messages: List[Message]) -> str:
        pass

    @abstractmethod
    def get_json(messages: List[Message], schema: Union[str, Dict] = "") -> Dict:
        """Prefer OpenAI as it has Structured Outputs support"""
        pass


JSON_SYSTEM_PROMPT = """Additionally, you are requested strictly to output ONLY VALID JSON.
Please follow the schema closely to generate the JSON. Remember, the most important thing is for the JSON
to be valid!"""
JSON_STOP_AT_ATTEMPT = 2


class Anthropic(LLM):
    def __init__(self, system_prompt: str):
        self.client = AnthropicClient(
            api_key=os.environ.get("ANTHROPIC_API_KEY"),
        )
        self.system_prompt = system_prompt
        self.default_model = "claude-3-5-sonnet-20241022"
        self.max_tokens = 4096

    def respond(self, messages: List[Message]) -> str:
        res = self.client.messages.create(
            system=self.system_prompt,
            messages=messages,
            model=self.default_model,
            max_tokens=self.max_tokens,
        )

        return res.content[0].text

    @retry(
        stop=stop_after_attempt(JSON_STOP_AT_ATTEMPT),
        retry=retry_if_exception_type(
            (json.JSONDecodeError, jsonschema.exceptions.ValidationError)
        ),
    )
    def get_json(self, messages: List[Message], schema: Union[str, Dict] = "") -> Dict:
        """Validation not as good as OpenAI"""

        res = self.client.messages.create(
            system=self.system_prompt + JSON_SYSTEM_PROMPT,
            messages=messages,
            model=self.default_model,
            max_tokens=self.max_tokens,
        )
        json_data = json.loads(res.content[0].text)
        validate(instance=json_data, schema=schema)

        return json_data


class OpenAI(LLM):
    def __init__(self, system_prompt: str):
        self.client = OpenAIClient(
            api_key=os.environ.get("OPENAI_API_KEY"),
        )
        self.system_prompt = system_prompt
        self.default_model = "gpt-4o"
        self.max_tokens = 4096

    def respond(self, messages: List[Message]) -> str:
        res = self.client.chat.completions.create(
            messages=[{"role": "system", "content": self.system_prompt}] + messages,
            model=self.default_model,
            max_tokens=self.max_tokens,
        )

        return res.choices[0].message.content

    def get_json(self, messages: List[Message], schema: type[BaseModel]):

        res = self.client.beta.chat.completions.parse(
            messages=[{"role": "system", "content": self.system_prompt}] + messages,
            model=self.default_model,
            max_tokens=self.max_tokens,
            response_format=schema,
        )

        return res.choices[0].message.parsed


# sanity check models are working
if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()

    system_prompt = "You are a helpful assistant."
    schema = """Return a json with the following schema:
      {
        "name": string
        "nationality": number
      }
    """  # this does not work

    anthropic = Anthropic(system_prompt=system_prompt)
    print(
        anthropic.respond(
            messages=[{"role": "user", "content": "Say hello from Claude 👋"}]
        )
    )
    # print(
    #     anthropic.get_json(
    #         messages=[{"role": "user", "content": "Scott is from Singapore"}],
    #         schema=schema,
    #     )
    # )

    openai = OpenAI(system_prompt=system_prompt)
    print(
        openai.respond(
            messages=[{"role": "user", "content": "Say hello from OpenAI 👋"}]
        )
    )

    class Person(BaseModel):
        name: str
        age: int
        nationality: str

    print(
        openai.get_json(
            messages=[{"role": "user", "content": "Scott is from Singapore"}],
            schema=Person,
        )
    )
