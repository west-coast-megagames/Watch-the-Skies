import React from 'react';
import { FlexboxGrid } from 'rsuite'
import { Link } from 'react-router-dom'

const Home = (props) => {
    return (    
        <div className='tabContent' style={{paddingTop: '10px', height: 'calc(100vh - 50px)'}}>
            <h4>Current Build v0.1.3 d8 - Game Loop Development</h4>
            {props.login === false ? <span><Link to='/login'>Sign into Demo</Link> | </span>: null}<a href='https://discord.gg/m88Q6KH' target='blank'>West Coast Megagames Discord Server Invite</a> | <a href='https://github.com/west-coast-megagames/watch-the-skies/wiki'>WTS Prototype Roadmap</a>
            <hr />
            <p><b>Type:</b> Front-End Prototype / Demo | <b>Game:</b> Watch the Skies</p>
            <p><b>Purpose:</b> This application is to demo a possible way of playing <i>Watch the Skies</i> connected to the <b>Project Nexus</b> servers in development by <b>West Coast Megagames!</b></p>
            <p><b>Phase:</b> We are currently transitioning from designing <b>Project Nexus</b> as a digital backbone for live megagame events to the possibility of using it to run distributed and online games.</p>
            <p><b>Testing Cycle:</b> We are on our first round of testing for v0.1.0 - v0.1.3 we are expecting a lot of instability as we just fully refactored the front-end deployment. That being said, please play around with the interfaces and note your experence.</p>
            <p>If you experence a crash, please attempt to duplicate the crash and <a href='https://github.com/west-coast-megagames/watch-the-skies/issues' target='blank'>report it!</a> The more information you give me the better and of course work with me on discord. Thank you for your interest!</p> 
            <hr />
            <FlexboxGrid>
                <FlexboxGrid.Item colspan={12}>
                    <u><b>Implemented Features</b></u>
                    <p><small><b>Note:</b> Features implemented in the prototype with a server side implementation.</small></p>
                    <ul>
                        <li>Distributed Game Clock [Top Nav Bar & Came Control Tab]</li>
                        <li>Game Map [Operations Page | Map Tab]</li>
                        <li>Team Log / Game Timeline [Governance Page | Timeline Tab]</li>
                        <li>Team Budget / Banking [Governance Page | Budget Tab]</li>
                        <li>Interceptions & Air Missions [Operations Page | Map Tab]</li>
												<li>Ground Military System [Map | Map Page]</li>
                        <li>News Feed [News Page | News Feed Tabs]</li>
                        <li>News / PR Submission [News Page | News Feed Tab]</li>
                        <li>Applied Reserch System [Science Page | Research Tab]</li>
                        <li>Scientific Knowledge System [Science Page | Scientific Knowledge Tab]</li>
                        <li>Tech Tree [Science Page | Tech List]</li>
                    </ul>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={12}>
                    <u><b>Unimplemented Features</b></u>
                    <p><small><b>Note:</b> Features unimplemented in the prototype with a server side implementation.</small></p>
                    <ul>
                        <li>Ground Military System [Operations Page | Global Ops Tab]</li>
												<li>National Trade System [Diplomacy Page | Trades Tab]</li>
												<li>Alliance System [No placeholder in App]</li>
                        <li>Salvage [No placeholder in App]</li>
                    </ul>             
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={12}>
                    <u><b>Planned Features</b></u>
                    <p><small><b>Note:</b> Planned features with no current server side implementation.</small></p>
                    <ul>
                        <li>Nuclear Launches [Operations Page | Nuclear Tab]</li>
                        <li>Space Military System [No placeholder in App]</li>
                        <li>Treaty Ratification [Governance Page | Treaty Ratification Tab]</li>
                        <li>Unrest/Terror [Governance Page | Unrest Tab]</li>
                        <li>Espionage System [Governance Page | Espionage Tab]</li>
                        <li>Envoy System [Diplomacy Page | Envoy Tab]</li>
                        <li>Model System / Crisis & Proposals [Diplomacy Page | UN Security Council Tab]</li>
                        <li>Satillites [Not In App]</li> 
                    </ul>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={12}>
                    <u><b>Test Features</b></u>
                    <p><small><b>Note:</b> Features implemented to test possible dev directions.</small></p>
                    <ul>
                    </ul>
                </FlexboxGrid.Item>
            </FlexboxGrid>
        </div>
    );
}

export default Home;