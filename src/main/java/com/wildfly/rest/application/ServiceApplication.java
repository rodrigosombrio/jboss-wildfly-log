package com.wildfly.rest.application;

import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.core.Application;

import com.wildfly.rest.Log;

public class ServiceApplication extends Application  {
	private Set<Object> singletons = new HashSet<Object>();

	public ServiceApplication() {
		singletons.add(new Log());
	}

	@Override
	public Set<Object> getSingletons() {
		return singletons;
	}
}
