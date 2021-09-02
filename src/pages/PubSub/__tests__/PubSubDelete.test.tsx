import React from 'react';
import {render} from '@testing-library/react';
import PubSubDelete from '../PubSubDelete';
import {SubscriberDtoSubscribedEventEnum} from '../../../openapi';
import {PubSubCollection} from "../../../state/pub-sub/pubsub-service";

describe('Test PubSub Delete', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let data: PubSubCollection;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {

    });

    onClose = jest.fn().mockImplementation(() => {

    });

    data = {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      appClientUser: "SomeApp",
      events: [SubscriberDtoSubscribedEventEnum.PersonChange],
      subscriberAddress: "http://app.app.svc.cluster.local/",
      secret: "",
    }
  });

  it('Renders', () => {
    const pageRender = render(
      <PubSubDelete
        data={data}
        dataTypeName="Subscriber"
      />
    );

    expect(pageRender.getByTestId('data-crud-delete-content')).toBeInTheDocument();
    expect(pageRender.getByText(data.appClientUser)).toBeInTheDocument();
  });
})
