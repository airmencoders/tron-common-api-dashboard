import { createState, State, useState } from "@hookstate/core";
import Config from "../../api/configuration";
import { Configuration } from "../../openapi";
import { SubscriberControllerApi, SubscriberControllerApiInterface } from "../../openapi/apis/subscriber-controller-api";
import { SubscriberDto } from "../../openapi/models/subscriber-dto";
import PubSubService from "./pubsub-service";

const subscriberState = createState<SubscriberDto[]>(new Array<SubscriberDto>());
const pubSubApi: SubscriberControllerApiInterface = new SubscriberControllerApi(new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }));

export const wrapState = (
    state: State<SubscriberDto[]>, 
    api: SubscriberControllerApiInterface) => {
      return new PubSubService(state, api);
  }

export const useSubscriptionState = () => wrapState(
    useState(subscriberState),
    pubSubApi);