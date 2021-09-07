import { createState, State, useState } from "@hookstate/core";
import Config from "../../api/config";
import {Configuration, SubscriberDto} from "../../openapi";
import { SubscriberControllerApi, SubscriberControllerApiInterface } from "../../openapi/apis/subscriber-controller-api";
import PubSubService, { PubSubCollection } from "./pubsub-service";

const subscriberState = createState<PubSubCollection[]>(new Array<PubSubCollection>());  // this subscriber's consolidated representation
const subscribersData = createState<SubscriberDto[]>(new Array<SubscriberDto>());  // api's raw subscriptions for a given app client
const pubSubApi: SubscriberControllerApiInterface = new SubscriberControllerApi(new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }));

export const wrapState = (state: State<PubSubCollection[]>, api: SubscriberControllerApiInterface, data: State<SubscriberDto[]>) => {
      return new PubSubService(state, api, data);
}

export const useSubscriptionState = () => wrapState(
    useState(subscriberState),
    pubSubApi,
    subscribersData);