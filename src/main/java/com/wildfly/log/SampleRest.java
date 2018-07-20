package com.wildfly.log;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.fluig.sdk.api.FluigAPI;
import com.fluig.sdk.api.common.SDKException;
import com.fluig.sdk.api.social.PostVO;
import com.fluig.sdk.service.PostService;
import com.fluig.sdk.service.UserService;
import com.fluig.sdk.user.UserVO;
import com.fluig.sdk.web.FluigRest;

@Path("samplerest")
public class SampleRest extends FluigRest {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("name")
    public Response getMyProfile() {
        try {
            UserService userService = new FluigAPI().getUserService();
            UserVO currentUser = userService.getCurrent();
            return super.buildSuccessResponse(currentUser.getFullName());
        } catch (SDKException e) {
            return super.buildErrorResponse(e);
        }
    }

    @POST
    @Consumes(MediaType.TEXT_PLAIN)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/post")
    public Response createPost(String text) {
        try {
            PostVO post = new PostVO();
            post.setText(text);
            post.setVisibility("PUBLIC");

            PostService postService = new FluigAPI().getPostService();
            postService.create(post);
            return super.buildSuccessResponse();
        } catch (SDKException e) {
            return super.buildErrorResponse(e);
        }
    }

}
