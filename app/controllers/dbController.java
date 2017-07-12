package controllers;

/**
 * Created by patrickduffy on 7/12/17.
 */
import javax.inject.Inject;

import play.mvc.*;
import play.db.*;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class dbController extends Controller {

    private Database db;

    @Inject
    public dbController(Database db) {
        this.db = db;
    }

    public Result dbtestFunction() {
//        String query = "insert into draftdbtest.scenario " +
//                "values(3,3);";
//
//        try {
//            Connection connection = db.getConnection();
//            Statement stmt = connection.createStatement();
//
//
//            ResultSet rs = stmt.executeQuery(query);
//        } catch (SQLException e) {
//            //do something
//        }
//
        return null;
    }
}