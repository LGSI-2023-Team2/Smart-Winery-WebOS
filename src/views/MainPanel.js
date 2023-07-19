import { Panel, Header } from '@enact/sandstone/Panels';
import { Button } from '@enact/sandstone/Button';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import { useState, useMemo } from 'react';
import SettingModal from '../components/SettingModal';
import WineModal from '../components/WineModal';
import MoveWineModal from '../components/MoveWineModal';

import './MainPanel.css'
import { useEffect } from 'react';
import axios from 'axios';
import { DATABASE_IP } from '../database';

const tempImageUrl = "https://wine21.speedgabia.com/no_image2.jpg";

const SettingButton = ({ wine, isSmart, setSmart, nowTargetValue, setNowTargetValue, nowMode, setNowMode, cellar_id }) => {
	const [isModalOpen, setModalOpen] = useState(false);

	const handleOpenModal = () => {
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
	};

	return (
		<>
			<Button
				onClick={handleOpenModal}
				backgroundOpacity="transparent"
				size="small"
				icon="gear"
			/>
			<SettingModal
				wine={wine}
				isSmart={isSmart}
				setSmart={setSmart}
				isOpen={isModalOpen}
				nowTargetValue={nowTargetValue}
				setNowTargetValue={setNowTargetValue}
				nowMode={nowMode}
				setNowMode={setNowMode}
				onClose={handleCloseModal}
				cellar_id={cellar_id}
			/>
		</>
	);
};

const EditButton = ({ wine, cellar_id, nowMode, isSmart}) => {
	const [isEditModalOpen, setEditModalOpen] = useState(false);

	const handleOpenModal = () => {
		setEditModalOpen(true);
	};

	const handleCloseModal = () => {
		setEditModalOpen(false);
	};

	return (
		<>
			<Button
				onClick={handleOpenModal}
				backgroundOpacity="transparent"
				size="small"
				icon="edit"
			/>
			<MoveWineModal
				isOpen={isEditModalOpen}
				onClose={handleCloseModal}
				wine={wine}
				cellar_id={cellar_id}
				nowMode={nowMode}
				isSmart={isSmart}
			/>
		</>
	);
};

const WinePanel = ({ wineArrays, idx, setWineArrays, cellar_id }) => {
	const [isWineModalOpen, setWineModalOpen] = useState(false);

	const handleOpenModal = () => {
		setWineModalOpen(true);
	};

	const handleCloseModal = () => {
		setWineModalOpen(false);
	};

	const deleteWine = (idx) => {
		const newArray = [...wineArrays];
		newArray.splice(idx, 1);
		setWineArrays(newArray);
	};

	return (
		<>
			<Card style={{ boxShadow: 'none' }} className="image">
				<CardMedia
					style={{ boxShadow: 'none' }}
					onClick={handleOpenModal}
					component="img"
					height="100%"
					image={wineArrays[idx].wine_id.imgsrc}
					alt="wine"
				/>
			</Card>
			<WineModal
				isOpen={isWineModalOpen}
				onClose={handleCloseModal}
				wineArray={wineArrays}
				idx={idx}
				deleteWine={deleteWine}
				cellar_id={cellar_id}
			/>
		</>
	);
};

const EmptyWinePanel = () => (
	<Card style={{ boxShadow: 'none' }} className="image">
		<CardMedia
			style={{ boxShadow: 'none' }}
			component="img"
			height="100%"
			image={tempImageUrl}
			alt="wine"
		/>
	</Card>
);

const WinePanels = ({ wineArrays, setWineArrays, cellar_id }) => {
	const floorCount = 3;
	const winePanelCount = 5;
	const winePanelArray = [];

	for (let i = 0; i < floorCount; i++) {
		const temp = [];
		for (let j = 0; j < winePanelCount; j++) {
			temp.push(
				<div className="wine-box">
					<EmptyWinePanel />
				</div>
			);
		}
		winePanelArray.push(temp);
	}

	for (let i = 0; i < wineArrays.length; i++) {
		winePanelArray[wineArrays[i].row - 1][wineArrays[i].col - 1] = (
			<div className="wine-box">
				<WinePanel wineArrays={wineArrays} idx={i} setWineArrays={setWineArrays} cellar_id={cellar_id} />
			</div>
		);
	}

	return (
		<div className="wine-container">
			{winePanelArray.map((panel, index) => (
				<div className="wine-layout" key={index}>
					{panel}
				</div>
			))}
		</div>
	);
};

const ModePanel = ({ isSmart, type }) => {
	const modeMappings = ['None', 'Red', 'White', 'Sparkling'];

	const getModeText = (modeType, index) => {
		const modeText = modeMappings[modeType] || 'Unknown';
		return isSmart[index] ? modeText : 'User Mode';
	};

	return (
		<div className="mode-container">
			{type.map((mode, index) => (
				<div className="mode-box" key={index}>
					<div>{getModeText(mode, index)}</div>
				</div>
			))}
		</div>
	);
};

const TempPanel = ({ now, target }) => (
	<div className="temp-container">
		{now.map((nowTemp, index) => (
			<div className="temp-content" key={index}>
				<div className="temp-text">Now: {nowTemp}°C</div>
				<div className="temp-text">Target: {target[index]}°C</div>
			</div>
		))}
	</div>
);

const MainPanel = () => {
	//Wine Cellar Get
	const [cellarId, setCellarId] = useState("64b4f9a38b4dc227def9b5b1");
	const [data, setData] = useState(null);
	const [isSmart, setSmart] = useState([]);
	const [nowMode, setNowMode] = useState([]);
	const [nowSetValue, setNowSetValue] = useState([]);
	const [nowTargetValue, setNowTargetValue] = useState([]);
	const [wines, setWines] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(`${DATABASE_IP}:3000/winecellar/status?id=${cellarId}`);
				setData(response.data);
			} catch (error) {
				console.error(error);
			}
		};

		fetchData();

		const interval = setInterval(() => {
			fetchData();
		}, 5000);

		return () => {
			clearInterval(interval);
		};
	}, [cellarId]);

	useEffect(() => {
		if (data) {
			setSmart([
				data.floor1.is_smart_mode,
				data.floor2.is_smart_mode,
				data.floor3.is_smart_mode
			]);
			setNowMode([
				data.floor1.type,
				data.floor2.type,
				data.floor3.type
			]);
			setNowSetValue([
				data.floor1.temperature_now,
				data.floor2.temperature_now,
				data.floor3.temperature_now
			]);
			setNowTargetValue([
				data.floor1.temperature_target,
				data.floor2.temperature_target,
				data.floor3.temperature_target
			]);
			const wineIds = [
				...data.floor1.cell_ids,
				...data.floor2.cell_ids,
				...data.floor3.cell_ids
			];
			setWines(wineIds);
		}
	}, [data]);

	return (
		<Panel className="back">
			<Header title="Wine Cellar Dashboard">
				<slotAfter>
					<EditButton wine={wines} cellar_id={cellarId} nowMode={nowMode} isSmart={isSmart}/>
					<SettingButton
						wine={wines}
						isSmart={isSmart}
						setSmart={setSmart}
						nowSetValue={nowSetValue}
						setNowSetValue={setNowSetValue}
						nowTargetValue={nowTargetValue}
						setNowTargetValue={setNowTargetValue}
						nowMode={nowMode}
						setNowMode={setNowMode}
						cellar_id={cellarId}
					/>
				</slotAfter>
			</Header>
			<div className="main-container">
				<div className="contents-box">
					<ModePanel isSmart={isSmart} type={nowMode} />
					<WinePanels wineArrays={wines} setWineArrays={setWines} cellar_id={cellarId}/>
					<TempPanel now={nowSetValue} target={nowTargetValue} />
				</div>
			</div>
		</Panel>
	);
};

export default MainPanel;