package com.wildfly.log;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import com.wildfly.model.LogContent;

public class ReadLog {
	private String logPath = null;
	private long totalLines = 0;
	private String slash = System.getProperty("os.name").startsWith("Windows") ? "\\" : "/";

	public ReadLog() {
	}

	public ReadLog(String logFile) {
		this.logPath = this.getLogPath(logFile);
		this.totalLines = this.getTotalLines();
	}

	public List<String> getLogFiles() {
		List<String> logList = new ArrayList<String>();

		File folder = new File(System.getProperty("jboss.server.log.dir"));
		File[] listOfFiles = folder.listFiles();

		for (int i = 0; i < listOfFiles.length; i++) {
			if (listOfFiles[i].isFile() && listOfFiles[i].getName().indexOf(".log") > -1) {
				logList.add(listOfFiles[i].getName());
			}
		}
		return logList;
	}

	public LogContent getLog(long lastLine) {
		LogContent logContent = new LogContent();
		logContent.setLastLine(this.totalLines);
		logContent.setLog(getLastThousandLines(lastLine));
		logContent.setLogPath(this.logPath);
		return logContent;
	}

	private String getLogPath(String logFile) {
		return System.getProperty("jboss.server.log.dir") + slash + logFile;
	}

	private ArrayList<String> getLastThousandLines(long lastLine) {
		long firstLine = 0;
		if (lastLine == 0)
			firstLine = totalLines > 1000 ? totalLines - 1000 : 0;
		else
			firstLine = lastLine;

		return this.readFile(firstLine);
	}

	private long getTotalLines() {
		long totalLines = 0;
		try (BufferedReader br = new BufferedReader(new FileReader(logPath))) {
			while (br.readLine() != null) {
				totalLines++;
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		return totalLines;
	}

	private ArrayList<String> readFile(long firstLine) {
		ArrayList<String> lineValue = new ArrayList<String>();
		try (BufferedReader br = new BufferedReader(new FileReader(logPath))) {
			long totalLines = 0;
			String lineString = "";
			while ((lineString = br.readLine()) != null) {
				if (totalLines >= firstLine)
					lineValue.add(lineString);
				totalLines++;
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		return lineValue;
	}

	public byte[] createZipByteArray(String fileName) {
		byte[] buffer = new byte[4096];
		ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
		ZipOutputStream zos = new ZipOutputStream(byteArrayOutputStream);

		try {
			ZipEntry ze = new ZipEntry(fileName);
			zos.putNextEntry(ze);
			FileInputStream in = new FileInputStream(this.logPath);

			int len;
			while ((len = in.read(buffer)) > 0) {
				zos.write(buffer, 0, len);
			}
			in.close();
			zos.closeEntry();
			zos.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

		return byteArrayOutputStream.toByteArray();
	}
}
