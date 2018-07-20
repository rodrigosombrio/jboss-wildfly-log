package com.wildfly.rest;

import java.io.IOException;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.Response.Status;

import com.wildfly.log.ReadLog;
import com.wildfly.model.LogContent;

@Path("log")
public class Log {
	// private Logger log = LoggerFactory.getLogger(Log.class);

	@GET
	@Path("show/{line}/{file}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getLog(@PathParam("line") long line, @PathParam("file") String file) {

		ReadLog readLog = new ReadLog(file);
		LogContent logContent = readLog.getLog(line);

		return Response.status(200).entity(logContent).build();
	}

	@GET
	@Path("list")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getLogList() {
		ReadLog readLog = new ReadLog();
		List<String> logList = readLog.getLogFiles();
		return Response.status(200).entity(logList).build();
	}

	@GET
	@Path("/download/{fileName}")
	@Produces("application/octet-stream")
	public Response getLogInZip(@PathParam("fileName") String fileName) throws IOException {
		if (fileName == null || fileName.isEmpty()) {
			ResponseBuilder response = Response.status(Status.BAD_REQUEST);
			return response.build();
		}
		byte[] byteArrayLog = new ReadLog(fileName).createZipByteArray(fileName);
		ResponseBuilder response = Response.ok((Object) byteArrayLog);
		response.header("Content-Disposition", "attachment; filename=" + fileName + ".zip");
		return response.build();
	}
}
