import React, { Component } from 'react';
import { connect } from 'react-redux';
import { infoRequested } from '../store/entities/infoPanels';
import { getAircrafts } from '../store/entities/aircrafts';

class AircraftTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            aircrafts: this.props.aircrafts
        };
        this.getLocation = this.getLocation.bind(this);
    };

    componentDidUpdate(prevProps) {
        if (this.props.lastFetch !== prevProps.lastFetch) { this.setState({aircrafts: this.props.aircrafts}) }
    }

    getLocation = (aircraft) => {
        let location = aircraft.country !== undefined ? aircraft.country.name !== undefined ? aircraft.country.name : 'Unknown' : 'The Abyss'
        return location;
    }

    render() {
        console.log(this.state.aircrafts)
        const { length: count } = this.state.aircrafts;
        
        if (count === 0)
            return <h4>No interceptors currently available.</h4>
        return (
            <React.Fragment>
                <p>You currently have {count} interceptors in base.</p>
                <table className="table">
                <thead>
                    <tr>
                        <th>Aircraft</th>
                        <th>Pilot</th>
                        <th>Frame Damage</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Unit Info</th>
                    </tr>
                </thead>
                <tbody>
                { this.state.aircrafts.map(aircraft => (
                    <tr key={ aircraft._id }>
                        <td>{ aircraft.name }</td>
                        <td>Someone</td>
                        <td>{ 100 - Math.round(aircraft.stats.hull / aircraft.stats.hullMax * 100) }%</td>
                        <td>{ this.getLocation(aircraft) }</td>
                        <td>{ aircraft.mission }</td>
                        <td><button type="info" value="Info" onClick={ () => this.props.infoRequest(aircraft) } className="btn btn-info">Info</button></td>
                    </tr>
                    ))}
                </tbody>
            </table>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    aircrafts: getAircrafts(state),
    lastFetch: state.entities.aircrafts.lastFetch
})

const mapDispatchToProps = dispatch => ({
    infoRequest: aircraft => dispatch(infoRequested(aircraft))

});

export default connect(mapStateToProps, mapDispatchToProps)(AircraftTable);