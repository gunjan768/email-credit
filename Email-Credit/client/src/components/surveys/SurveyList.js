import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchSurveys } from '../../actions';
import CircularProgress from '@material-ui/core/CircularProgress'

class SurveyList extends Component 
{
	state = 
	{
		loading: true
	};

	async componentDidMount()
	{
		await this.props.fetchSurveys();

		this.setState({ loading: false });
	}

	renderSurveys() 
	{
		return this.props.surveys.reverse().map(survey => 
		{
			return (
				<div className="card blue-grey darken-1" key = { survey._id }>
					
					<div className="card-content">
						<span className="card-title">{survey.title}</span>
						<p>{ survey.body }</p>
						<p className="right">Sent On: { new Date(survey.dateSent).toLocaleDateString() }</p>
					</div>

					<div className="card-action" style = {{ display: "flex" }}>
						<div style = {{ marginRight: "10px" }}>Yes: { survey.yes }</div>
						<div>No: { survey.no }</div>
					</div>

				</div>
			);
		})
	}

	render() 
	{
		if(this.state.loading)
		{
			return 	(
				<div style = {{ position: "absolute" , top: "50%", left: "50%" }}>
					<CircularProgress color="secondary" />
				</div>
			)
			
		}

		return (
			<div>
				{ this.renderSurveys() }
			</div>
		);
	}
}

function mapStateToProps({ surveys }) 
{
  	return { surveys };
}

export default connect(mapStateToProps, { fetchSurveys })(SurveyList);