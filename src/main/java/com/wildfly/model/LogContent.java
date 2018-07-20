package com.wildfly.model;

import java.util.ArrayList;

public class LogContent {
	private String logPath;
	private long lastLine;

	public String getLogPath() {
		return logPath;
	}

	public void setLogPath(String logPath) {
		this.logPath = logPath;
	}

	private ArrayList<String> log;

	public long getLastLine() {
		return lastLine;
	}

	public void setLastLine(long lastLine) {
		this.lastLine = lastLine;
	}

	public ArrayList<String> getLog() {
		return log;
	}

	public void setLog(ArrayList<String> log) {
		this.log = log;
	}
}
