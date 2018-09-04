import React, { Component } from 'react';
import { getEntropyBits } from './entropy';

class Main extends Component {
	constructor(props) {
		super(props);
		this.state = {
			text: '',
			storedBits: 0,
			money: 0,
			bitCost: 1.95,
			pepperCost: 100,
			numPeppers: 0,
		}
	}

	componentDidMount() {
		//start the automatic price updater
		this.updateBitCost();
	}

	updateBitCost() {
		//+/- 10% of current cost
		const diff = (Math.random() * 0.2 - 0.1) * this.state.bitCost
		this.setState({
			bitCost: this.state.bitCost + diff,
		});
		//update price every 5 seconds
		setTimeout(() => this.updateBitCost(), 5000);
	}

	handleTextInput(event) {
		const text = event.target.value;
		if(text[text.length-1] === '\n') {
			//store bits
			this.setState({
				text: '',
				storedBits: this.state.storedBits + getEntropyBits(text),
			});
		} else {
			this.setState({
				text: text,
			});
		}
	}

	handleBuyBits(amount) {
		const cost = amount * this.state.bitCost;
		this.setState({
			storedBits: this.state.storedBits + amount,
			money: this.state.money - cost,
		});
	}

	handleBuyPepper() {
		this.setState({
			numPeppers: this.state.numPeppers + 1,
			money: this.state.money - this.state.pepperCost,
			pepperCost: this.state.pepperCost * 2,
		});
	}

	renderBuyBits(amount, key) {
		return (
			<li key={key}>
				<button onClick={() => this.handleBuyBits(amount)}>
					Buy {amount} bit{amount === 1 ? "" : "s"}
				</button>
			</li>
		);
	}

	handleSellBits(amount) {
		const cost = amount * this.state.bitCost;
		this.setState({
			storedBits: this.state.storedBits - amount,
			money: this.state.money + cost,
		});
	}

	renderSellBits(amount, key) {
		return (
			<li key={key}>
				<button onClick={() => this.handleSellBits(amount)}>
					Sell {amount} bit{amount === 1 ? "" : "s"}
				</button>
			</li>
		);
	}


	renderShop() {
		//start with buying/selling 1 bit
		//have a log scale going up to what the user can afford
		
		//buying bits
		const affordableBits = [];
		let cur = 1;
		while(this.state.money >= cur * this.state.bitCost) {
			affordableBits.push(cur);
			cur *= 10;
		}
		//selling bits
		const sellableBits = [];
		cur = 1;
		while(this.state.storedBits >= cur) {
			sellableBits.push(cur);
			cur *= 10;
		}

		return (
			<div className="shop">
				Current Price: {dollarStringFormat(this.state.bitCost)}/bit
				<div className="in-a-row">
					<ul>
						{sellableBits.map((amount, i) => this.renderSellBits(amount, i))}
					</ul>
					<ul>
						{affordableBits.map((amount, i) => this.renderBuyBits(amount, i))}
					</ul>
					<button
						disabled={this.state.money < this.state.pepperCost}
						onClick={() => this.handleBuyPepper()}
					>
						Buy Pepper ({dollarStringFormat(this.state.pepperCost)})
					</button>
				</div>
			</div>
		);
	}

	renderInput() {
		return (
			<textarea rows="10" cols="50"
				value={this.state.text}
				onChange={(e) => this.handleTextInput(e)}
			/>
		);
	}

	renderStatus() {
		return (
			<p>
				Bits of entropy: {this.state.storedBits}<br/>
				Cash: {dollarStringFormat(this.state.money)}
			</p>
		);
	}

	renderPepper(key) {
		return (
			<img key={key} src='pepper.png' width="30" height="30"></img>
		);
	}

	renderPeppers() {
		return (
			<div className="in-a-row" alt="green is my pepper">
				{Array.from({length: this.state.numPeppers}, (x,i) => 
					this.renderPepper(i))}
			</div>
		);
	}

	render() {
		return (
			<div>
				<p>
					Type in the text box to generate entropy<br/>
					Press enter to store your bits.
				</p>
				<div className="in-a-row">
					{this.renderInput()}
					{this.renderShop()}
				</div>
				{this.renderStatus()}
				{this.renderPeppers()}
			</div>
		);
	}
}

const dollarFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

function dollarStringFormat(num) {
	return dollarFormatter.format(num);
}

export default Main;
