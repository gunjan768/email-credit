import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Header extends Component 
{
	renderContent() 
	{
		switch(this.props.auth) 
		{
			case null:
				return;

			case false:
				return <li><a href="/auth/google">Login With Google</a></li>;

			default:
				return [
					<li key="1" style = {{ margin: '0 10px' }}><Link to = { '/payment' }>Payment</Link></li>,
					<li key="2" style = {{ margin: '0 10px' }}>Credits: { this.props.auth.credits }</li>,
					<li key="3"><a href="/api/logout">Logout</a></li>
				];
		}
	}

	render() 
	{
		return (
			<nav style = {{ marginBottom: "20px" }}>
				<div className="nav-wrapper">
					<Link to = { this.props.auth ? '/surveys' : '/' } className="left brand-logo">Emaily</Link>
					<ul className="right">
						{ this.renderContent() }
					</ul>
				</div>
			</nav>
		);
	}
}

const mapStateToProps = ({ auth }) =>
{
  	return { auth };
}

export default connect(mapStateToProps)(Header);