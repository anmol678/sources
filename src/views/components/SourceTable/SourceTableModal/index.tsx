import * as React from 'react';
import * as Modal from 'react-modal';
import { graphql, compose } from 'react-apollo';
import * as gql from 'graphql-tag';

import { addSource, updateSource, sourcesQuery } from '../graphql';
import './style.scss';

export enum ModalType {
  Add,
  Edit,
}

export interface Source {
  id: string;
  name: string;
  organization: string;
  phones: string;
  emails: string;
  notes: string;
}

interface SourceTableModalProps {
  /** Whether or not the modal is open. */
  isOpen: boolean;
  /** Function for the modal to call on close. */
  onRequestClose: () => void;
  /** Label for Modal. */
  contentLabel: string;
  /** Type of modal. Can either be Add or Edit. */
  type: ModalType;
  source: Source;

  addSource: any;
  updateSource: any;
}

interface SourceTableModalState {
  nameInputValue: string;
  organizationInputValue: string;
  phonesInputValue: string;
  emailsInputValue: string;
  notesInputValue: string;
  selectedSourceID: string;
}

/**
 * The popup modal for a SourceTable. It comes in 2 variants, Add and Edit which is specified by the type prop.
 */
class SourceTableModal extends React.Component<
  SourceTableModalProps,
  SourceTableModalState
> {
  public state = {
    nameInputValue: '',
    organizationInputValue: '',
    phonesInputValue: '',
    emailsInputValue: '',
    notesInputValue: '',
    selectedSourceID: '',
  };

  public createSource = async event => {
    event.preventDefault();
    const {
      nameInputValue: name,
      organizationInputValue: organization,
      phonesInputValue: phones,
      emailsInputValue: emails,
      notesInputValue: notes,
    } = this.state;

    await this.props.addSource({
      variables: {
        name,
        organization,
        phones,
        emails,
        notes,
      },
      update: (store, { data: { addSource: sourceToAdd } }) => {
        const data = store.readQuery({ query: sourcesQuery });
        data.sources.unshift(sourceToAdd);
        store.writeQuery({ query: sourcesQuery, data });
      },
    });
    this.props.onRequestClose();
  };

  public render() {
    const isAdd = this.props.type === ModalType.Add;
    const label = isAdd ? 'Add a Source' : 'Edit Source';

    const styles = {
      content: {
        top: '6rem',
        left: '4rem',
        right: '4rem',
        bottom: 'auto',
      },
    };

    return (
      <Modal
        style={styles}
        contentLabel={label}
        onAfterOpen={this.initializeInputs}
        {...this.props}
      >
        <h1 className="modal__header">{label}</h1>
        <form
          className="modal__form"
          onSubmit={isAdd ? this.createSource : this.updateSource}
        >
          <div className="modal__form__input-field">
            <label htmlFor="name">Source Name: </label>
            <input
              id="name"
              onChange={this.onChange}
              value={this.state.nameInputValue}
              type="text"
            />
          </div>
          <div className="modal__form__input-field">
            <label htmlFor="organization">Source Organization: </label>
            <input
              id="organization"
              onChange={this.onChange}
              value={this.state.organizationInputValue}
              type="text"
            />
          </div>
          <div className="modal__form__input-field">
            <label htmlFor="phones">Source Phone: </label>
            <input
              id="phones"
              onChange={this.onChange}
              value={this.state.phonesInputValue}
              type="text"
            />
            <div className="modal__form__input-field__note">
              Work: (xxx) xxx-xxxx; Cell: (xxx) xxx-xxxx; etc.
            </div>
          </div>
          <div className="modal__form__input-field">
            <label htmlFor="emails">Source Email: </label>
            <input
              id="emails"
              type="text"
              onChange={this.onChange}
              value={this.state.emailsInputValue}
            />
            <div className="modal__form__input-field__note">
              Work: suzy@dailybruin.com; Home: suzy@gmail.com; etc.
            </div>
          </div>
          <div className="modal__form__input-field">
            <label htmlFor="notes">Notes: </label>
            <textarea
              id="notes"
              onChange={this.onChange}
              value={this.state.notesInputValue}
              rows={4}
            />
          </div>
          <input type="submit" value={isAdd ? 'Create' : 'Update'} />
        </form>
      </Modal>
    );
  }

  /**
   * Initialize the input values of the modal's fields.
   *
   * If the modal is an add modal, all fields should be blank. If it's an edit modal, the fields should be the current values of the select source's attributes.
   */
  private initializeInputs = () => {
    const { source } = this.props;
    if (this.props.type === ModalType.Edit) {
      this.setState({
        nameInputValue: source.name,
        organizationInputValue: source.organization,
        phonesInputValue: source.phones,
        emailsInputValue: source.emails,
        notesInputValue: source.notes,
      });
    }
  };

  /**
   * Updates the state of the modal on a change of the value of the respective input field.
   */
  private onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = event.currentTarget;

    switch (event.currentTarget.id) {
      case 'name':
        this.setState({ nameInputValue: value });
        break;
      case 'organization':
        this.setState({ organizationInputValue: value });
        break;
      case 'phones':
        this.setState({ phonesInputValue: value });
        break;
      case 'emails':
        this.setState({ emailsInputValue: value });
        break;
      case 'notes':
        this.setState({ notesInputValue: value });
        break;
      default:
        break;
    }
  };

  /**
   * Makes a GraphQL request to update a selected source. Should only be used by an edit modal.
   */
  private updateSource = async (event: React.FormEvent<HTMLInputElement>) => {
    // Prevent default because we don't want a page refresh
    event.preventDefault();

    const {
      selectedSourceID: sourceToUpdateID,
      nameInputValue: name,
      organizationInputValue: organization,
      phonesInputValue: phones,
      emailsInputValue: emails,
      notesInputValue: notes,
    } = this.state;

    await this.props.updateSource({
      // `variables` gives GraphQL which variables to update
      variables: {
        id: sourceToUpdateID,
        name,
        organization,
        phones,
        emails,
        notes,
      },
      // `update` lets update update the local GraphQL cache so we don't have to refresh to see changes
      update: store => {
        // Get data from cache
        const data = store.readQuery({ query: sourcesQuery });

        // Find source by id, update it.
        const sourceToUpdate = data.sources.find(
          source => source.id === sourceToUpdateID
        );
        Object.assign(sourceToUpdate, {
          id: sourceToUpdateID,
          name,
          organization,
          phones,
          emails,
          notes,
        });

        // Write modified data back to cache
        store.writeQuery({ query: sourcesQuery, data });
      },
    });

    // Close the modal after submit
    this.props.onRequestClose();
  };
}

export default compose(
  graphql(addSource, { name: 'addSource' }),
  graphql(updateSource, { name: 'updateSource' })
)(SourceTableModal);
