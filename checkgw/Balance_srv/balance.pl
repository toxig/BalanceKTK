#!/usr/bin/perl
use strict;
use CGI;
use XML::Simple;
use IO::Handle '_IOLBF';
use IO::File;
use GnuPG::Interface ;
use Net::EasyTCP;
use Data::Dumper;
use DBI;
use URI::Escape;
use Encode;

#########################################
# Скрипт проверки баланса в АСР Атлант ЦБ
# Доступ к БД под пользователем MIGRNN
# Процедура проверки ABS_CHECK_BALANCE
# ver 1.0 - 27.02.2015 - AChernikov
#########################################

#$ENV{'ABS_IO_SOCKET'}='/usr/local/var/abs/xv3s';	# Test abs v.3

####################
# DB Connect params
####################
	my $log_path = '/usr/local/apache2/htdocs/checkgw/Balance_srv/history';
	#require "$ENV{DOCUMENT_ROOT}/Balance_KTK/dbconfig.pl";
	#our $avkdb_params;  # DB connect params in dbconfig.pl
	my $avkdb_params = {
		 'datasource'   => "dbi:Oracle:host=192.168.167.114;sid=atldb;port=1521",
		 'username'	=> "MIGRNN",
		 'password'	=> "PE8X6BWU8",
		 'attr'		=> {PrintError => 0},
	};	

####################
# Main
####################
	
    # First of all print the header
    print "Content-Type: text/plain; charset=\"UTF-8\"\n\n";  #  charset=\"UTF-8\"	charset=\"WINDOWS-1251\" Content-Type: text/xml;
		
    #print %ENV,"\n\n\n";   
    #d.decode('cp1251').encode('utf8')
	   
    my $debug = 0;
    my $payment_source = 1007;    

    if( $ENV{'SCRIPT_NAME'} =~ /_debug/ )	{ $debug = 1; }
    if( $ENV{'SCRIPT_NAME'} =~ /\/pay(\d+)/ )	{ $payment_source = $1; }
    if( $ENV{'SCRIPT_NAME'} =~ /\/telebank/ )	{ $payment_source = 404; }

    if( $debug ) { 
		printf "Source: %s / Debug: %s / User IP: %s\n", $ENV{'SCRIPT_NAME'}, $debug, $ENV{REMOTE_ADDR}; 
		#printf "DB: %s\n",join(',',%$avkdb_params);
		#printf "DB: %s\n",%$avkdb_params->{'datasource'};		
		use CGI::Carp qw(fatalsToBrowser); # error msg to browser
	}
		

    unless( $payment_source )
	{
	printf "Can not found payment_source\n"; 
	exit;
	}

    my (@ciphertext, @errmsg);
    &do_check( $payment_source, \@ciphertext, \@errmsg);

    print join('',@errmsg),"\n";
    print join('',@ciphertext),"\n";

####################
# END - Main
####################


#################################
# Do Check - Run Check Query
#################################
sub do_check
{
    my( $payment_source, $text, $errmsg ) = @_;

    if( $debug ) { printf "*** [do_check] enter:\n"; }

    #** Process input data

    my $document = &get_http_input();
    my $log_file = &log_req( $document, 'request' );
    my $reqstr = $document; #&decrypt( $document, $gnupg, $input,$output,$error,$handles, $debug);

    unless ($reqstr)
    {
	print "Error: no input message\n";
	exit;
    }

	#my $request=XMLin( $reqstr, ForceArray => ['payment']  );
    my $request=XMLin( $reqstr, ForceArray=>0);	
	$request->{'client_ip'} = $ENV{'REMOTE_ADDR'};	    
	$request->{'reqlink'} = sprintf "%s%s",$ENV{'SERVER_NAME'},$ENV{'SCRIPT_NAME'};	
	
    ### Get Reply from DB ###    
    #my $reply = &ask_avk( $request, $payment_source );	
	my $reply = &db_ask( $request );	

    my $response = {
	'request' => $request,
	'result' => $reply,
    };
	
	# if( $debug ) { print "req: ",Dumper($response),"\n"; }

    my $xml_out = XMLout($response, RootName=>'response', NoAttr=>1, NoEscape=>1);
    $log_file = &log_req( $xml_out, 'response' );

    ### Finally ###
    
    print $xml_out;

    ## if request type "pay" and result is "ok" nheh write record into pay_file
    #if  (($request -> {type} eq 'pay') && ($reply -> {str} -> [0] eq 'ok'))
    #    {
    #		&pay_file($request, $payment_source);
    #    }
    
    if( $debug ) { printf "*** [do_check] exit.\n"; }
    return 1;
}
####################
# END - Do Check
####################


############################
# GET HTTP INPUT - load http
############################
sub get_http_input
{
    # Process input data

    my $q = new CGI;
    my $document=$q->param('document'); # utf8 cp1251			

    if( $debug )
	{ print "*** [get_http_input]:\n Document data is:\n=====\n$document\n=====\n";
	  # printf "uri_escape:  \"%s\"\n", uri_escape($document);
	  # printf "uri_unescape:  \"%s\"\n", uri_unescape($document);	  
	  # printf "document encode utf8: %s\n",encode('utf8',$document); 
	  # printf "document encode cp1251: %s\n",encode('cp1251',$document); 
	  printf "document decode utf8: %s\n",decode('utf8',$document); 	  
	  printf "document decode cp1251: %s\n",decode('cp1251',$document); 	  
	  # printf "document encode('utf8',decode('cp1251'): %s\n",$document; 
	  print "=====\n"	  
	}		
	
    return $document;
}
#######################
# END - GET HTTP INPUT
#######################


#################################
# DB Connect - Simple connect & Query
#################################
sub db_connect
{
	my( $db_params ) = @_;		
	
	if ($debug) { printf "*** [db_connect]: User: %s\n",$db_params->{'username'};}
	
    my $dbh
     = DBI->connect(
        $db_params->{'datasource'},
        $db_params->{'username'},
        $db_params->{'password'},
        $db_params->{'attr'}) or die "Cannot connect !! to database: $DBI::errstr\n";
    #$dbh->{oracle_auto_reconnect}=1;

	if ($dbh) { 
		if ($debug) {print "*** [db_connect]: DB Connected!\n";}		
	}
	
	return $dbh;
}


#################################
# DB Query - Simple Query
#################################
sub db_query
{
	my( $dbh, $req_arg ) = @_;
	my $timestamp = formattime();
	
	if ($debug) { print "*** [db_query] enter\n" } #"\n Request Args: ",Dumper($req_arg),"\n";
	
	unless ($dbh) {return "DB Not connected";}
	
	# Test Query
	my $sth_conn_chk = $dbh->prepare( qq{ SELECT * FROM DUAL } );
	if ($debug) { print "executing: SELECT * FROM DUAL\n"; }
	$sth_conn_chk->execute();	
	$sth_conn_chk->finish();

	# Query Resault
	if( $DBI::err != 0 ) { 
		if ($debug) { 
			if ($DBI::err) { print "exec result: ",$DBI::err,"\n"; }
			print "exec res: (ERROR) try reconnect ... "; 			
		}
		$dbh = db_connect($avkdb_params); # Reconnect
	}
	else 
	{
		if ($debug) { print "exec res: (OK)\n";}
	}	
	
	unless ($dbh) {return "DB Connect error";}
	
	# Proc work Query
	my $sth_chk= $dbh->prepare(
		q{
            BEGIN
				ACHERNIKOV.abs_check_balance
				(
				  :userid,				  
				  :id_type,
				  :id_type_name,
				  :id_status,
				  :rbalance,
				  :user_uid,
				  :nmbplan,
				  :sum_abon,
				  :changed,
				  :msg,
				  :str,
				  :rc,
				  :client_ip,
				  :client_link
				);
			END;
		}
    );
	
	#// создаем параметры			
	my $userid = $req_arg->{userid};
	my $id_type = $req_arg->{id_type};
	my $client_ip = $req_arg->{client_ip};	
	my $client_link = $req_arg->{reqlink};		
	my $rc;
    my $timestamp_out;
    my $str;
    my $msg;
    my $retry;
    my $rbalance;
	my $sum_abon;
	my $nmbplan;
	my $user_uid;
	my $id_status;
	my $id_type_name;	
	
	if ($debug) {printf "Query params: userid: %s, id_type %s, client_ip: %s \n", $userid, $id_type, $ENV{REMOTE_ADDR};}
	
    $sth_chk->bind_param(":userid", $userid);    
    $sth_chk->bind_param(":id_type", $id_type);
	$sth_chk->bind_param(":client_ip", $client_ip);	
	$sth_chk->bind_param(":client_link", $client_link);
	$sth_chk->bind_param_inout(":id_type_name", \$id_type_name,255); # bind this parameter as an "out"
	$sth_chk->bind_param_inout(":id_status", \$id_status,255); # bind this parameter as an "out"
    $sth_chk->bind_param_inout(":rbalance", \$rbalance,10); # bind this parameter as an "out"	
	$sth_chk->bind_param_inout(":user_uid", \$user_uid,255); # bind this parameter as an "out"
	$sth_chk->bind_param_inout(":nmbplan", \$nmbplan,255); # bind this parameter as an "out"
	$sth_chk->bind_param_inout(":sum_abon", \$sum_abon,10); # bind this parameter as an "out"
	$sth_chk->bind_param_inout(":changed", \$timestamp_out,255); # bind this parameter as an "out"
	$sth_chk->bind_param_inout(":msg", \$msg,255); # bind this parameter as an "out"
	$sth_chk->bind_param_inout(":str", \$str,255); # bind this parameter as an "out"
    $sth_chk->bind_param_inout(":rc", \$rc,10);	
	
	if ($debug) { print "executing: ABS_CHECK_BALANCE\n"; }
	#print "Executing  ABS_FUNCTIONS.ABS_CHECK:\n userid = ", $userid, "\nlogin = ", $login, "\npaymentsource = ", $paymentsource, "\n";

    $sth_chk->execute;
	
	if ($debug) { 
		printf "msg: %s\n",$msg;  #encode('utf8',decode('cp1251',$msg)); 
		printf "msg encode utf8: %s\n",encode('utf8',$msg); 
		printf "msg encode cp1251: %s\n",encode('cp1251',$msg); 
		printf "msg decode utf8: %s\n",decode('utf8',$msg); 		
		printf "msg decode cp1251: %s\n",decode('cp1251',$msg); 
		printf "msg encode_utf8(decode_cp1251(msg)): %s\n",encode('utf8',decode('cp1251',$msg)); 
	}
	
	# Proc query resault
	if( $DBI::err != 0 ) {
		if ($debug) { print "exec res: (ERROR)\n*** [db_query] exit\n";}
		my $error = 'Database error '.$DBI::errstr ;
		return {
			'timestamp' => [$timestamp],
			'rc' =>     ['-21'],
			'str' => 	[$error],
			'msg' =>   	[decode('utf8','Ошибка выполнения запроса БД')],			
			};
	}
    else
    {
		if ($debug) { 
			print "exec res: (OK)\n*** [db_query] exit\n"; 
		}
		
		# DB сервер возвращает результат в cp1251		
		return {
			'id_type_name' =>   [decode('cp1251',$id_type_name)],
			'id_status' =>     	[decode('cp1251',$id_status)],
			'rbalance' =>     	[decode('cp1251',$rbalance)],
			'user_uid' =>     	[decode('cp1251',$user_uid)],
			'nmbplan' =>     	[decode('cp1251',$nmbplan)],
			'sum_abon' =>     	[decode('cp1251',$sum_abon)],
			'timestamp' => 	[decode('cp1251',$timestamp_out)],
			'rc' =>     	[decode('cp1251',$rc)],
			'str' => 		[decode('cp1251',$str)],
			'msg' =>   		[decode('cp1251',$msg)],	
		};
		
		
			# 'id_type_name' =>   [$id_type_name],
			# 'id_status' =>     	[$id_status],
			# 'rbalance' =>     	[$rbalance],
			# 'user_uid' =>     	[$user_uid],
			# 'nmbplan' =>     	[$nmbplan],
			# 'sum_abon' =>     	[$sum_abon],
			# 'timestamp' => 	[$timestamp_out],
			# 'rc' =>     	[$rc],
			# 'str' => 		[$str],
			# 'msg' =>   		[$msg],		
					
    }	
	if ($debug) { print "*** [db_query] exit\n"; }
	
	return "Query OK";
}

#################################
# DB Ask - Simple connect & Query
#################################
sub db_ask
{
	if( $debug ) { printf "*** [db_ask] enter:\n"; }
	
	my( $request ) = @_;	
	my %args=%$request;
	    
	# Modify request Params
	
	##delete %args->{'type'};		    	
	#if ( (index $args{'userid'}, "HASH(") >= 0) { $args{'userid'} = ""; }
	#else { $args{'userid'} .= "";}	
	#else { $args{'userid'} = decode('utf8',"КТК-1575");}
	if ( !defined $args{'userid'} ) { $args{'userid'} = ""; }
	
    $args{'id_type'} += 0; #trunc value/null to num option	

	if( $debug ) { print "Args structure:\n",Dumper(\%args); }
	
	# Connect Database
	my $dbh = db_connect($avkdb_params);
	
	# Run Query and Get Query Reply
	my $reply = db_query($dbh,\%args);
	
	# If Reply not comming
    if( !ref($reply) )
    { 	
		if( $debug ) { printf "Error read Reply: \"%s\"\n", $reply; }				
		my %dumb_perl;
		$reply = \%dumb_perl;		
		
		$reply->{'rc'} = -1;
		$reply->{'msg'} = decode('utf8',"Сервер: ошибка подключения к Базе. Попробуйте позже...");
		$reply->{'str'} = "Error Get reply from DB [Ask DB]";		
		
		my ($sec,$min,$hour,$mday,$mon,$year) = localtime(time);
		$reply->{'timestamp'} = sprintf "%4d%02d%02d%02d%02d%02dZ", 1900+$year, $mon+1, $mday, $hour, $min, $sec;
	}

    if( $debug ) { print "Reply structure:\n",Dumper($reply); }
	if( $debug ) { printf "*** [db_ask] exit.\n"; }
	
    return $reply; 	
}
#################################
# END - DB Ask
#################################


#################################
# Ask AVK - Run Check Query - OLD
#################################
sub ask_avk
{
    my( $request, $payment_source, $debug ) = @_;
  
    if( $debug )
	{ print "*** Payment source:\n",Dumper($payment_source); }

    my %args=%$request;
    delete %args->{'type'};

    # Modify request Structure
    $args{'userid'} += 0;
    $args{'paymentsource'} = $payment_source; # add option
    $args{'paymentsource'} += 0; #trunc value/null to num option
            
    
    if( $debug )
	{
	print "*** ASK AVK, request structure:\n",Dumper($request);
	print "*** ASK AVK, args structure:\n",Dumper(\%args);
	}
    
    my $reply;
    
    # Create DB Service Connect
    my $check = new Net::EasyTCP
    (
            mode            =>      "client",
            host            =>      'localhost',
            port            =>      4661,
    )
    || die "ERROR CREATING CLIENT: $@\n"; #$@

    $check->send(\%args) || die "ERROR SENDING: $@\n";
    $reply = $check->receive() || die "ERROR RECEIVING: $@\n";

    # If Reply not comming
    if( !ref($reply) )
    {
	if( $debug )
	    { printf "*** Error Reply: \n%s\n", $reply; }

	my($rc, $str) = split( ' ', $reply, 2);

	my %dumb_perl;
	$reply = \%dumb_perl;

	$reply->{'rc'} = $rc;
	$reply->{'str'} = $str;
	$reply->{'msg'} = "Error Get reply MSG from [Ask AVK]";
	#$reply->{'retry'} = 300;
	my ($sec,$min,$hour,$mday,$mon,$year) = localtime(time);
	$reply->{'timestamp'} = sprintf "%4d%02d%02d%02d%02d%02dZ",
			1900+$year, $mon+1, $mday, $hour, $min, $sec;
	}

    if( $debug )
	{ print "*** Reply structure:\n",Dumper($reply); }
	
    return $reply;  
}
#################################
# END - Ask AVK
#################################


####################
# LOG Request 
####################
sub log_req
{
    my( $msg, $suff ) = @_;    

    #my $log_path = '/usr/local/apache2/htdocs/check/balance_srv/history';    	
    #my $log_path = "$ENV{DOCUMENT_ROOT}/Balance_KTK/history";    
	
    if( $debug ) {		
		printf "SCRIPT_FILENAME: %s\nSCRIPT_NAME: %s\nLOG_PATH: %s\n", $ENV{SCRIPT_FILENAME},$ENV{SCRIPT_NAME}, $log_path;
	}       

    my($sec,$min,$hour,$mday,$mon,$year) = localtime(time);

    my $f_year = sprintf "%4d", 1900+$year;
    my $f_mon  = sprintf "%02d", $mon+1;
    my $f_day  = sprintf "%02d", $mday;	
    my $ff  = sprintf "%s.%02d%02d%02d%02d.%d.%s", $ENV{'SERVER_NAME'}, $mday, $hour, $min, $sec, $$, $suff;

	if ($debug) { $f_day = "debug";}
	
    # folder Log
    unless( -d "$log_path" )    
    { 
      printf "Log folder not exist (creating): %s\n", "$log_path";
	    
      unless (mkdir "$log_path")
	{
	    printf "Can not create directory %s\nError: %d\n", "$log_path", $!;
	    exit;
        }
    }

    # folder Year
    unless( -d "$log_path/$f_year" )
    { unless (mkdir "$log_path/$f_year")
	{
	    printf "Can not create directory %s\nError: %d\n", "$log_path/$f_year", $!;
	    exit;
        }
    }

    # folder Month
    unless( -d "$log_path/$f_year/$f_mon" )
    { unless (mkdir "$log_path/$f_year/$f_mon")
	{
	    printf "Can not create directory %s\nError: %d\n", "$log_path/$f_year/$f_mon", $!;
	    exit;
    	}
    }

    # folder Day
    unless( -d "$log_path/$f_year/$f_mon/$f_day" )
    { unless (mkdir "$log_path/$f_year/$f_mon/$f_day")
        {
            printf "Can not create directory %s\nError: %d\n", "$log_path/$f_year/$f_mon/$f_day", $!;
    	    exit;
    	}
    }

    # folder File
    unless( open(FN, ">$log_path/$f_year/$f_mon/$f_day/$ff") )
    {
        printf "Can not open log file %s\nError: %d\n", ">$log_path/$f_year/$f_mon/$f_day/$ff", $!;
	exit;
    }

    print FN $msg;
    close(FN);
    return "$log_path/$f_year/$f_mon/$f_day/$ff";    
}
####################
# END - LOG Request
####################


########################################
# Format Local Time
########################################
sub formattime {
    my $timestamp;
    my ($sec,$min,$hour,$mday,$mon,$year) = localtime(time);
	$timestamp = sprintf "%4d.%02d.%02d %02d:%02d:%02d",
			1900+$year, $mon+1, $mday, $hour, $min, $sec;
            return $timestamp;
}




####################
# Other Trash SUB
####################
sub ask_avk2
{
    my( $request, $payment_source, $debug ) = @_;
    my $func;
    my %funcs = (
	'check'     => 460001,
        'pay'       => 460002,
        'total'     => 460003,
    );
    
    # FTTB hack
    #if( $args{'userid'} > 900000000 ) {
    #    if( $func == 229380 ) { $func = 460001; }
    #    elsif( $func == 360455 ) { $func = 460002; }
    #    }

    #if( $func == 196613 ) {
    #    if( $args{'paylist'}->{'payment'}[0]->{'userid'} > 900000000 )
    #        { $func = 460003; }
    #    }
    # end of FTTB hack

    #    if( $args{'userid'} < 1000000 ) {
    # Add to KTV-s userid 292000000
    #    if( substr($payment_source, -1) == 5) { $args{'userid'} +=292000000; }
    # Add to KTK-Absolute userid 291000000
    #    if( substr($payment_source, -1) == 2) { $args{'userid'} +=291000000; } } 
}


sub verify_sig
{
my( $document, $gnupg, $input, $output, $error, $handles, $debug ) = @_;

# Verify signature
if( $debug ) { print "[verify_sig]: start\n";}	

my $pid = $gnupg->verify( handles => $handles );
#my $pid = $gnupg->decrypt( handles => $handles );

#print $input $document,"\n";
close $input;
my @reqdoc = <$output>;
my $reqstr = join('',@reqdoc);
close $output;
my @errmsg = <$error>;
close $error;
waitpid $pid, 0;


my $gpg_rc = $?;

if( $gpg_rc )
	{
	print "GnuPG return code is $gpg_rc\n";
	print join('',@errmsg),"\n";	
	#exit; # exit when bad verify
	}

if( $debug )
		{ print "*** [verify_sig]: Reqstr verify_sig:\n=====\n$reqstr\n====\n"; }

return $reqstr;
}


sub decrypt
{
my( $document, $gnupg, $input, $output, $error, $handles, $debug ) = @_;

# Verify signature

#my $pid = $gnupg->verify( handles => $handles );
my $pid = $gnupg->decrypt( handles => $handles );

print $input $document,"\n";
close $input;
my @reqdoc = <$output>;
my $reqstr = join('',@reqdoc);
close $output;
my @errmsg = <$error>;
close $error;
waitpid $pid, 0;


my $gpg_rc = $?;

if( $gpg_rc )
	{
	print "GnuPG return code is $gpg_rc\n";
	print join('',@errmsg),"\n";
	exit;
	}

if( $debug )
		{ print "Reqstr decript:\n=====\n$reqstr\n====\n"; }
		#{ print $reqstr,"\n"; }

return $reqstr;
}


sub sign_responce
{
my( $text, $errmsg,
	$gnupg, $input, $output, $error, $handles, $debug ) = @_;
my $pid = $gnupg->clearsign( handles => $handles );
close $input;

@{$text} = <$output>;
close $output;
#print Dumper($text);
@{$errmsg} = <$error>;
close $error;

waitpid $pid, 0;

return 1;
}



# put pay record into pay file
sub pay_file
{
my($request, $payment_source) = @_;

my $pay_path = '/usr/local/apache2/htdocs/paygw/payfiles';

my $userid = $request -> {userid};
my $amount = $request -> {amount};
my $timestamp = $request -> {timestamp};
my $requestid = $request -> {requestid};

# my($sec,$min,$hour,$mday,$mon,$year) = localtime(time);

# create payfile name
my $pfname  = sprintf "PS%s_%s.%d", $timestamp, $requestid, $payment_source;

my($sec,$min,$hour,$mday,$mon,$year) = localtime(time);
my $paydate = sprintf "%02d.%02d.%04d %02d:%02d:%02d",$mday,$mon+1,$year+1900,$hour,$min,$sec;

# create record
my $paystr = sprintf "PaySystem_%s, %s, %.2f, %s, %s", $payment_source, $userid, $amount, $paydate, $requestid;

unless( open(FN, ">$pay_path/$pfname") )
        {
	  printf "Can not open pay file %s\n", ">$pay_path/$pfname";
	  exit;
	}
				
print FN $paystr;
close(FN);
return "$pay_path/$pfname";
}

