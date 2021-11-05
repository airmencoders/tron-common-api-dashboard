import { createState, State, useState } from "@hookstate/core";
import { globalOpenapiConfig } from '../../api/openapi-config';
import { SubscriberDto } from "../../openapi";
import { SubscriberControllerApi, SubscriberControllerApiInterface } from "../../openapi/apis/subscriber-controller-api";
import PubSubService, { PubSubCollection } from "./pubsub-service";

const subscriberState = createState<PubSubCollection[]>(new Array<PubSubCollection>());  // this subscriber's consolidated representation
const subscribersData = createState<SubscriberDto[]>(new Array<SubscriberDto>());  // api's raw subscriptions for a given app client
const pubSubApi: SubscriberControllerApiInterface = new SubscriberControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapState = (state: State<PubSubCollection[]>, api: SubscriberControllerApiInterface, data: State<SubscriberDto[]>) => {
  return new PubSubService(state, api, data);
}

export const useSubscriptionState = () => wrapState(
  useState(subscriberState),
  pubSubApi,
  subscribersData);