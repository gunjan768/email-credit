// SurveyForm shows a form for a user to add input
import _ from 'lodash';
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { Link } from 'react-router-dom';
import SurveyField from './SurveyField';
import validateEmails from '../../utils/validateEmails';
import formFields from './formFields';

class SurveyForm extends Component 
{
	renderFields() 
	{
		// _.map() is a function from lodash and it is for objects. It accepts two arguments: 1st --> object , 2nd --> callback that will
		// run for each element ( similiar to map() for an array ).
		return _.map(formFields, ({ label, name }) => 
		{
			return (
				// All the props that are written in the Field tag will be passed to the user created component ( SurveyField ). All props
				// key, type, label, name will be passed to the SurveyField component.
				<Field
					key = { name }
					component = { SurveyField }
					type="text"
					label = { label }
					name = { name }
				/>
			);
		})
	}

	render() 
	{
		return (
			<div>
				<form onSubmit = { this.props.handleSubmit(this.props.onSurveySubmit) }>
					
					{ this.renderFields() }
					
					<Link to="/surveys" className="red btn-flat white-text">Cancel</Link>
					
					<button type="submit" className="teal btn-flat right white-text">
						Next <i className="material-icons right">done</i>
					</button>

				</form>
			</div>
		);
	}
}

// This validateForm will be called automatically whenever you will be write anything. This function will also be fired as soon as
// this page will mount. This function accepts one parameter and it is automatically passed. This parameter will be an object which
// will contain name as key and value as value ( key-value pairs ).
const validateForm = values => 
{
	const errors = {};
	
	errors.recipients = validateEmails(values.recipients || '');

	_.each(formFields, ({ name }) => 
	{
		if(!values[name]) 
		{
			errors[name] = 'You must provide a value';
		}
	});

	// Error object ( errors ) that will be returned, automatically get attached to the form name. You can access error inside meta prop.
	return errors;
}

// All the values will be stored as key-value where key is name attribute and value is the value we enter. You can go to the formReducer
// and inside that you will find the form with it's name and inside that form you will have 'values' prop and inside that all the values
// are stored.
export default reduxForm({validate: validateForm, form: 'surveyForm', destroyOnUnmount: false})(SurveyForm);